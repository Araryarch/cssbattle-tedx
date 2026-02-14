"use server";

import { db } from "@/db";
import { submissions, users, challenges, contests, contestChallenges, comments, unlockedSolutions, contestParticipants, contestSolutions, contestLeaderboard } from "@/db/schema";
import { eq, desc, asc, sql, and, gt, inArray, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";
import { updateUserRankAction } from "@/lib/user-actions";

// Helper: Check if challenge is in an ACTIVE contest and return ID
async function getActiveContestForChallenge(challengeId: string) {
    const [activeContest] = await db
        .select({ id: contests.id })
        .from(contests)
        .innerJoin(contestChallenges, eq(contests.id, contestChallenges.contestId))
        .where(and(
            eq(contestChallenges.challengeId, challengeId),
            eq(contests.isActive, true),
            gt(contests.endTime, new Date()) // Contest is still running
        ))
        .limit(1);
    return activeContest?.id || null;
}

// Helper: Check if user has a valid submission (> 70% accuracy)
// Also used to determine if user can see solutions
async function hasUserSolvedChallenge(userId: string, challengeId: string) {
  const userSubmissions = await db
    .select({ accuracy: submissions.accuracy })
    .from(submissions)
    .where(and(
        eq(submissions.userId, userId),
        eq(submissions.challengeId, challengeId)
    ));
    
  return userSubmissions.some(sub => {
      const acc = parseFloat(sub.accuracy);
      return !isNaN(acc) && acc >= 70;
  });
}

// Helper: Check if user has unlocked the challenge (forfeited points)
async function hasUserUnlockedChallenge(userId: string, challengeId: string) {
    const [unlocked] = await db
        .select()
        .from(unlockedSolutions)
        .where(
            and(
                eq(unlockedSolutions.userId, userId),
                eq(unlockedSolutions.challengeId, challengeId)
            )
        )
        .limit(1);
    return !!unlocked;
}

export async function unlockSolutionsAction(challengeId: string) {
    try {
        const session = await verifySession();

        if (!session?.userId) return { error: "Unauthorized" };

        // 1. Mark as unlocked in specific table
        await db.insert(unlockedSolutions).values({
            userId: session.userId as string,
            challengeId,
        }).onConflictDoNothing();

        // 2. Insert a "forfeit" submission so it counts as "Completed" (accuracy 100) but with 0 Score
        // This satisfies "hasUserSolvedChallenge" checks while preventing point gain.
        // We use a specific ID based on user+challenge to strictly enforce one such record if desired, 
        // or just randomUUID to treat it as a new attempt.
        // Let's use a new submission to preserve history if they had previous partial attempts.
        
        await db.insert(submissions).values({
            id: crypto.randomUUID(),
            userId: session.userId as string,
            challengeId,
            code: "/* Solutions Unlocked - Points Forfeited */",
            accuracy: "100", // Marks as solved
            score: "0",      // No points awarded
            duration: 0,
            chars: 0,
        });

        revalidatePath(`/battle/${challengeId}/solutions`);
        revalidatePath(`/battle/${challengeId}`);
        
        // Update rank just in case (though score 0 won't change it much, it might affect "challenges solved" count)
        await updateUserRankAction(session.userId as string);

        return { success: true };
    } catch (error) {
         console.error("Error unlocking solutions:", error);
         return { error: "Failed to unlock solutions" };
    }
}

export async function saveSubmissionAction(data: {
  challengeId: string;
  code: string;
  accuracy: number;
  score: number;
  duration: number; // New field
}) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
      return { error: "Unauthorized" };
    }

    // Rate limiter (unchanged)
    const now = Date.now();
    const key = `sub-${session.userId}`;
    // @ts-expect-error Attach to globalThis to persist per worker
    const store: Map<string, number> = (globalThis.__rate__ ||= new Map());
    const last = store.get(key) || 0;
    if (now - last < 3000) {
      return { error: "Too Many Requests" };
    }
    store.set(key, now);

    // Check if user has forfeited points (unlocked solutions)
    const isUnlocked = await hasUserUnlockedChallenge(session.userId as string, data.challengeId);
    
    // If unlocked, force score to 0
    const finalScore = isUnlocked ? 0 : data.score;

    // Check if submission exists
    const existing = await db.query.submissions.findFirst({
        where: and(
            eq(submissions.userId, session.userId),
            eq(submissions.challengeId, data.challengeId)
        )
    });

    let id = existing?.id || crypto.randomUUID();

    if (existing) {
        // Update existing submission ONLY if the new score is better or equal
        // OR if it's unlocked (0 pts), we might still want to save the code if accuracy is better? 
        // Let's stick to update if score is better. If unlocked (0 pts), updates only happen if previous best was 0.
        // But what if they had a legit 100 pts score, unlocked solutions (weird edge case, maybe they want to see other sol?), 
        // and then submitted again? The unlock logic should probably only apply if they haven't solved it yet? 
        // The prompt says "if haven't solved -> warn -> forfeit". If already solved, they have access anyway.
        // So `isUnlocked` implies they probably haven't solved it with a high score yet.
        
        const currentScore = parseFloat(existing.score || "0");
        
        // If unlocked, we only save if better accuracy, but score stays 0
        if (finalScore >= currentScore || (isUnlocked && data.accuracy > parseFloat(existing.accuracy))) {
             await db.update(submissions)
                .set({
                    code: data.code,
                    accuracy: data.accuracy.toString(),
                    score: finalScore.toString(),
                    duration: data.duration,
                    chars: data.code.length,
                    createdAt: new Date(), // Update timestamp
                })
                .where(eq(submissions.id, existing.id));
        }
    } else {
        // Insert new submission
        await db.insert(submissions).values({
            id,
            userId: session.userId as string,
            challengeId: data.challengeId,
            code: data.code,
            accuracy: data.accuracy.toString(),
            score: finalScore.toString(),
            duration: data.duration,
            chars: data.code.length, 
        });
    }

    // --- Contest Logic ---
    const activeContestId = await getActiveContestForChallenge(data.challengeId);
    
    if (activeContestId) {
        // 1. Save specific contest solution (History)
        await db.insert(contestSolutions).values({
            contestId: activeContestId,
            userId: session.userId,
            challengeId: data.challengeId,
            code: data.code,
            score: finalScore.toString(),
            accuracy: data.accuracy.toString(),
            chars: data.code.length,
            duration: data.duration,
            createdAt: new Date()
        });
        
        // 2. Update leaderboard (Total Score)
        // Get Max Score per Challenge for this user in this contest
        const userBestScores = await db
            .select({
                score: sql<number>`MAX(CAST(${contestSolutions.score} AS REAL))`
            })
            .from(contestSolutions)
            .where(and(
                eq(contestSolutions.contestId, activeContestId),
                eq(contestSolutions.userId, session.userId)
            ))
            .groupBy(contestSolutions.challengeId);
            
        const totalScore = userBestScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const challengesSolved = userBestScores.length;

        await db.insert(contestLeaderboard)
            .values({
                contestId: activeContestId,
                userId: session.userId,
                totalScore,
                challengesSolved,
                lastSubmissionAt: new Date()
            })
            .onConflictDoUpdate({
                target: [contestLeaderboard.contestId, contestLeaderboard.userId],
                set: {
                    totalScore,
                    challengesSolved,
                    lastSubmissionAt: new Date()
                }
            });
            
        revalidatePath(`/contest/${activeContestId}`);
    }

    revalidatePath(`/battle/${data.challengeId}`);
    
    // Update user rank asynchronously
    await updateUserRankAction(session.userId as string);

    return { success: true, id };
  } catch (error) {
    console.error("Database error in saveSubmissionAction:", error);
    return { error: "Failed to save submission" };
  }
}

export async function getSubmissionsAction(challengeId: string) {
  try {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.challengeId, challengeId))
      .orderBy(desc(submissions.createdAt));
  } catch (error) {
    console.error("Database error in getSubmissionsAction:", error);
    return [];
  }
}

// New comprehensive stats fetcher
export async function getUserChallengeStatsAction(challengeId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) return null;

    // Fetch best submission (High Score)
    const [best] = await db
      .select({
        score: submissions.score,
        accuracy: submissions.accuracy,
        duration: submissions.duration,
        chars: sql<number>`COALESCE(${submissions.chars}, LENGTH(${submissions.code}))`,
        createdAt: submissions.createdAt
      })
      .from(submissions)
      .where(sql`${submissions.userId} = ${session.userId} AND ${submissions.challengeId} = ${challengeId}`)
      .orderBy(desc(submissions.score)) // Order by score first
      .limit(1);

    // Fetch latest submission
    const [latest] = await db
      .select({
        score: submissions.score,
        accuracy: submissions.accuracy,
        duration: submissions.duration,
        chars: sql<number>`COALESCE(${submissions.chars}, LENGTH(${submissions.code}))`,
        createdAt: submissions.createdAt
      })
      .from(submissions)
      .where(sql`${submissions.userId} = ${session.userId} AND ${submissions.challengeId} = ${challengeId}`)
      .orderBy(desc(submissions.createdAt)) // Order by time
      .limit(1);

    // Check if user has solved (any submission >= 70%)
    const isSolved = await hasUserSolvedChallenge(session.userId as string, challengeId);

    // Check if user has unlocked (forfeited points)
    const isUnlocked = await hasUserUnlockedChallenge(session.userId as string, challengeId);

    return {
      best: best ? { ...best, score: Number(best.score), accuracy: Number(best.accuracy), duration: best.duration || 0, chars: best.chars || 0 } : null,
      latest: latest ? { ...latest, score: Number(latest.score), accuracy: Number(latest.accuracy), duration: latest.duration || 0, chars: latest.chars || 0 } : null,
      isUnlocked,
      isSolved 
    };
  } catch (error) {
    console.error("Database error in getUserChallengeStatsAction:", error);
    return null;
  }
}
// Admin: Get All Submissions (paginated)
export async function getAllSubmissionsAction(page = 1, limit = 50) {
  try {
    const session = await verifySession();

    if (!session?.userId || session.role !== "admin") {
      return { data: [], total: 0 };
    }

    const offset = (page - 1) * limit;

    const data = await db
      .select({
        id: submissions.id,
        userId: submissions.userId,
        userName: users.name,
        userEmail: users.email,
        challengeId: submissions.challengeId,
        challengeTitle: challenges.title,
        challengeTarget: challenges.targetCode,
        challengeImage: challenges.imageUrl,
        code: submissions.code,
        score: submissions.score,
        accuracy: submissions.accuracy,
        duration: submissions.duration,
        chars: submissions.chars,
        createdAt: submissions.createdAt,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .leftJoin(challenges, eq(submissions.challengeId, challenges.id))
      .orderBy(desc(submissions.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: sql<number>`COALESCE(count(*), 0)` }).from(submissions);

    return { 
        data, 
        total: total.count || 0,
        page,
        totalPages: Math.ceil((total.count || 0) / limit) 
    };
  } catch (error) {
    console.error("Database error in getAllSubmissionsAction:", error);
    return { data: [], total: 0 };
  }
}


// Helper to sync legacy/missing submissions to contest tables
async function syncContestLeaderboard(contestId: string) {
    // 1. Fetch all necessary data
    // Contest
    const [contest] = await db.select().from(contests).where(eq(contests.id, contestId)).limit(1);
    if (!contest) return;

    // Participants
    const participants = await db
        .select({ userId: contestParticipants.userId })
        .from(contestParticipants)
        .where(eq(contestParticipants.contestId, contestId));

    // Challenges
    const links = await db.select().from(contestChallenges).where(eq(contestChallenges.contestId, contestId));
    const challengeIds = links.map(l => l.challengeId);
    
    // Submissions (Only valid ones)
    let validSubmissionsMatches: typeof submissions.$inferSelect[] = [];
    if (challengeIds.length > 0) {
        validSubmissionsMatches = await db.select().from(submissions)
           .where(and(
               inArray(submissions.challengeId, challengeIds),
               gt(submissions.createdAt, contest.startTime),
               lte(submissions.createdAt, contest.endTime)
           ));
    }

    // 2. Prepare Data Structures
    const leaderboardMap = new Map<string, { totalScore: number, solvedCount: number, lastSub: Date }>();
    const userChallengeBest = new Map<string, number>(); // userId|challengeId -> score

    // Initialize with participants (0 score)
    participants.forEach(p => {
        leaderboardMap.set(p.userId, { 
            totalScore: 0, 
            solvedCount: 0, 
            lastSub: new Date(0) 
        });
    });

    // Process submissions - Find BEST score per challenge for each user
    validSubmissionsMatches.forEach(sub => {
        const userId = sub.userId;
        const challengeId = sub.challengeId;
        const score = parseFloat(sub.score) || 0;
        const createdAt = sub.createdAt;

        if (!leaderboardMap.has(userId)) {
             leaderboardMap.set(userId, { 
                totalScore: 0, 
                solvedCount: 0, 
                lastSub: new Date(0) 
            });
        }
        
        const stats = leaderboardMap.get(userId)!;
        if (createdAt > stats.lastSub) {
            stats.lastSub = createdAt;
        }

        const key = `${userId}|${challengeId}`;
        const currentBest = userChallengeBest.get(key) || 0;
        if (score > currentBest) {
            userChallengeBest.set(key, score);
        }
    });

    // Update contestSolutions (History) - Only keep one entry per user per challenge if we want to be strict,
    // but the DB schema for contest_solutions doesn't have a unique constraint on (contestId, userId, challengeId).
    // The previous code was inserting ALL valid submissions into contest_solutions every sync.
    // Let's refine the sync to be more efficient or at least correct for the leaderboard.

    // Aggregate final scores
    // Reset totals before summing to avoid double counting if I initialized randomly
    // (Already 0).
    const userSolvedSet = new Map<string, Set<string>>(); // userId -> Set<challengeId>

    for (const [key, bestScore] of userChallengeBest) {
        const [userId, challengeId] = key.split('|');
        const stats = leaderboardMap.get(userId);
        if (stats) {
            stats.totalScore += bestScore;
            // Count solved (attempted/scored > 0)
            if (!userSolvedSet.has(userId)) userSolvedSet.set(userId, new Set());
            userSolvedSet.get(userId)!.add(challengeId);
        }
    }

    // Update solved counts
    for (const [userId, set] of userSolvedSet) {
        const stats = leaderboardMap.get(userId);
        if (stats) stats.solvedCount = set.size;
    }

    // 3. Atomic Rebuild leaderboard data
    // We only need to insert into contestLeaderboard for the summary view.
    // The previous code was inserting then deleting, which could cause race conditions.
    // However, Drizzle's delete followed by insert is the standard way to rebuild.
    
    // To be absolutely safe against duplicates during insertion, we use entries from our Map
    const leaderboardEntries = Array.from(leaderboardMap.entries()).map(([userId, stats]) => ({
        contestId,
        userId,
        totalScore: stats.totalScore,
        challengesSolved: stats.solvedCount,
        lastSubmissionAt: stats.lastSub
    }));

    if (leaderboardEntries.length > 0) {
        // Clear old data
        await db.delete(contestLeaderboard).where(eq(contestLeaderboard.contestId, contestId));
        
        // Chunked insert
        const chunkSize = 500;
        for (let i = 0; i < leaderboardEntries.length; i += chunkSize) {
            const chunk = leaderboardEntries.slice(i, i + chunkSize);
            await db.insert(contestLeaderboard).values(chunk);
        }
    }
    
    // Similarly for contestSolutions if needed, but the primary issue is the leaderboard summary.
    // Let's also ensure contestSolutions are unique per (user, challenge) if we're rebuilding it here.
    const bestSolutions = Array.from(userChallengeBest.keys()).map(key => {
        const [userId, challengeId] = key.split('|');
        const score = userChallengeBest.get(key) || 0;
        // Find the actual submission object to get the code/accuracy/etc
        const sub = validSubmissionsMatches.find(s => s.userId === userId && s.challengeId === challengeId && parseFloat(s.score) === score);
        return sub ? {
            contestId,
            userId,
            challengeId,
            code: sub.code,
            score: sub.score,
            accuracy: sub.accuracy,
            chars: sub.chars,
            duration: sub.duration,
            createdAt: sub.createdAt
        } : null;
    }).filter(Boolean);

    if (bestSolutions.length > 0) {
        await db.delete(contestSolutions).where(eq(contestSolutions.contestId, contestId));
        const chunkSize = 500;
        for (let i = 0; i < bestSolutions.length; i += chunkSize) {
            const chunk = (bestSolutions as any[]).slice(i, i + chunkSize);
            await db.insert(contestSolutions).values(chunk);
        }
    }
    
    console.log(`[Sync] Rebuilt leaderboard for ${contestId}. ${leaderboardMap.size} users.`);
}

// Global Leaderboard (Sum of best scores per challenge)
export async function getContestLeaderboardAction(contestId: string, limit = 100) {
  try {
     // Ensure data is up to date
     await syncContestLeaderboard(contestId);

     const leaderboard = await db
        .select({
            userId: contestLeaderboard.userId,
            userName: users.name,
            userImage: users.image,
            totalScore: contestLeaderboard.totalScore,
            challengesSolved: contestLeaderboard.challengesSolved,
            lastSubmissionAt: contestLeaderboard.lastSubmissionAt,
        })
        .from(contestLeaderboard)
        .leftJoin(users, eq(contestLeaderboard.userId, users.id))
        .where(eq(contestLeaderboard.contestId, contestId))
        .orderBy(desc(contestLeaderboard.totalScore), asc(contestLeaderboard.lastSubmissionAt))
        .limit(limit);
     
     console.log(`[Leaderboard] Found ${leaderboard.length} entries`);

     return leaderboard.map((l, i) => ({ 
         ...l, 
         rank: i + 1,
         totalScore: Number(l.totalScore)
     }));
  } catch (error) {
     console.error("Database error in getContestLeaderboardAction:", error);
     return [];
  }
}

export async function getGlobalLeaderboardAction(limit = 100) {
  try {
    // 1. Get max score per (user, challenge)
    const maxScores = db
      .select({
        userId: submissions.userId,
        challengeId: submissions.challengeId,
        maxScore: sql<number>`MAX(CAST(${submissions.score} AS REAL))`.as('max_score'),
      })
      .from(submissions)
      .groupBy(submissions.userId, submissions.challengeId)
      .as('max_scores');

    // 2. Sum these max scores per user
    const leaderboard = await db
      .select({
        userId: maxScores.userId,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        totalScore: sql<number>`SUM(${maxScores.maxScore})`,
        challengesSolved: sql<number>`COUNT(${maxScores.challengeId})`,
      })
      .from(maxScores)
      .leftJoin(users, eq(maxScores.userId, users.id))
      .groupBy(maxScores.userId, users.name, users.email, users.role)
      .orderBy(sql`${sql`SUM(${maxScores.maxScore})`} DESC`)
      .limit(limit);

    // Calculate Rank Title based on score - 8flex to 1grid
    return leaderboard.map((l, i) => {
        const score = Number(l.totalScore);
        let rankTitle = "8flex";
        
        if (l.userRole === 'admin') {
            rankTitle = "dev";
        } else {
            if (score >= 15000) rankTitle = "1grid";
            else if (score >= 10000) rankTitle = "1flex";
            else if (score >= 7500) rankTitle = "2flex";
            else if (score >= 5000) rankTitle = "3flex";
            else if (score >= 3500) rankTitle = "4flex";
            else if (score >= 2000) rankTitle = "5flex";
            else if (score >= 1000) rankTitle = "6flex";
            else if (score >= 500) rankTitle = "7flex";
        }
        
        return { 
            ...l, 
            rank: i + 1,
            rankTitle
        };
    });
  } catch (error) {
    console.error("Database error in getGlobalLeaderboardAction:", error);
    return [];
  }
}

// Get solutions for a challenge (if solved)
export async function getChallengeSolutionsAction(challengeId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
       return { authorized: false, solutions: [] };
    }

    if (session.role !== 'admin') {
        const userId = session.userId as string;

        // 1. Check if challenge is in an active contest (Strict Mode)
        const activeContestId = await getActiveContestForChallenge(challengeId);
        if (activeContestId) {
            return { authorized: false, solutions: [], reason: "Contest in progress" };
        }

        // 2. Check if user solved it with > 70% accuracy
        const solved = await hasUserSolvedChallenge(userId, challengeId);
        if (!solved) {
            // 3. Check if user has unlocked the challenge (forfeit points)
            const unlocked = await hasUserUnlockedChallenge(userId, challengeId);
            if (!unlocked) {
                return { authorized: false, solutions: [], reason: "Accuracy too low" };
            }
        }
    }

    // Return all submissions for this challenge with user info
    // Order by Highest Score, then Time
    const rawSolutions = await db
      .select({
        id: submissions.id,
        userId: submissions.userId,
        userName: users.name,
        code: submissions.code,
        score: submissions.score,
        accuracy: submissions.accuracy,
        duration: submissions.duration,
        chars: submissions.chars,
        createdAt: submissions.createdAt,
        commentCount: sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.submissionId} = ${submissions.id})`,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .where(eq(submissions.challengeId, challengeId))
      .orderBy(desc(sql`CAST(${submissions.score} AS REAL)`), desc(submissions.createdAt))
      .limit(100); 

    // Grouping Logic: Merge users with identical code
    const groupedMap = new Map<string, typeof rawSolutions[0] & { userNames: string[] }>();

    for (const sol of rawSolutions) {
        if (!sol.code) continue;
        const key = sol.code.trim(); // Normalize code
        
        if (groupedMap.has(key)) {
            const existing = groupedMap.get(key)!;
            if (sol.userName) {
                existing.userNames.push(sol.userName);
            }
        } else {
            groupedMap.set(key, { 
                ...sol, 
                userNames: sol.userName ? [sol.userName] : [] 
            });
        }
    }

    const solutions = Array.from(groupedMap.values()).map(sol => ({
        ...sol,
        userName: sol.userNames.join(", ") || "Anonymous"
    }));

    return { authorized: true, solutions: solutions.slice(0, 50) }; // Return top 50 unique solutions
  } catch (error) {
    console.error("Database error in getChallengeSolutionsAction:", error);
    return { authorized: false, solutions: [] };
  }
}

// Get solutions for a contest challenge (filtered by time and accuracy > 75%)
export async function getContestSolutionsAction(contestId: string, challengeId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) {
       return { authorized: false, solutions: [], reason: "Unauthorized" };
    }

    // 1. Get Contest Details
    const [contest] = await db
      .select({ startTime: contests.startTime, endTime: contests.endTime })
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (!contest) return { authorized: false, solutions: [], reason: "Contest not found" };

    const now = new Date();
    // If contest is running, only admin can see
    if (now < contest.endTime && session.role !== 'admin') {
         return { authorized: false, solutions: [], reason: "Contest in progress" };
    }

    // 2. Fetch submissions within time window AND accuracy >= 75
    const rawSolutions = await db
      .select({
        id: submissions.id,
        userId: submissions.userId,
        userName: users.name,
        code: submissions.code,
        score: submissions.score,
        accuracy: submissions.accuracy,
        duration: submissions.duration,
        chars: submissions.chars,
        createdAt: submissions.createdAt,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .where(and(
         eq(submissions.challengeId, challengeId),
         gt(submissions.createdAt, contest.startTime),
         sql`CAST(${submissions.accuracy} AS REAL) >= 75`
      ))
      .orderBy(desc(sql`CAST(${submissions.score} AS REAL)`), desc(submissions.createdAt))
      .limit(100);

    // Grouping Logic
    const groupedMap = new Map<string, typeof rawSolutions[0] & { userNames: string[] }>();

    for (const sol of rawSolutions) {
        if (!sol.code) continue;
        const key = sol.code.trim(); 
        
        if (groupedMap.has(key)) {
            const existing = groupedMap.get(key)!;
            if (sol.userName) {
                existing.userNames.push(sol.userName);
            }
        } else {
            groupedMap.set(key, { 
                ...sol, 
                userNames: sol.userName ? [sol.userName] : [] 
            });
        }
    }

    const solutions = Array.from(groupedMap.values()).map(sol => ({
        ...sol,
        userName: sol.userNames.join(", ") || "Anonymous"
    }));

    return { authorized: true, solutions: solutions.slice(0, 50) };
  } catch (error) {
    console.error("Database error in getContestSolutionsAction:", error);
    return { authorized: false, solutions: [] };
  }
}

export async function getContestUserSubmissionsAction(contestId: string, targetUserId: string) {
  try {
    const session = await verifySession();

    if (!session?.userId) return { success: false, error: "Unauthorized" };

    const [contest] = await db.select().from(contests).where(eq(contests.id, contestId)).limit(1);
    if (!contest) return { success: false, error: "Contest not found" };
    
    const isEnded = new Date() > contest.endTime;
    const isSelf = session.userId === targetUserId;
    const isAdmin = session.role === "admin";
    
    // If contest is active, only show self or admin
    if (!isEnded && !isSelf && !isAdmin) {
         return { success: false, error: "Contest in progress. Solutions hidden.", restricted: true };
    }

    // Get challenges
    const contestChalls = await db
        .select({ 
            id: challenges.id, 
            title: challenges.title,
            imageUrl: challenges.imageUrl,
            targetCode: challenges.targetCode,
            description: challenges.description,
            difficulty: challenges.difficulty 
        })
        .from(contestChallenges)
        .innerJoin(challenges, eq(contestChallenges.challengeId, challenges.id))
        .where(eq(contestChallenges.contestId, contestId));

    const challengeIds = contestChalls.map(c => c.id);
    if (challengeIds.length === 0) return { success: true, results: [] };

    // Get submissions
    // We exclude 'chars' and 'duration' from select to avoid crashes if DB migration hasn't been run
    const userSubs = await db
        .select({
            id: submissions.id,
            challengeId: submissions.challengeId,
            code: submissions.code,
            score: submissions.score,
            accuracy: submissions.accuracy,
            createdAt: submissions.createdAt
        })
        .from(submissions)
        .where(and(
            eq(submissions.userId, targetUserId),
            inArray(submissions.challengeId, challengeIds),
            gt(submissions.createdAt, contest.startTime),
            lte(submissions.createdAt, contest.endTime)
        ));

    // Sort by score in JS to avoid SQL casting errors or non-numeric strings
    userSubs.sort((a, b) => {
        const scoreA = parseFloat(a.score) || 0;
        const scoreB = parseFloat(b.score) || 0;
        return scoreB - scoreA;
    });
    
    // Group best per challenge
    const bestSubs = new Map();
    for (const sub of userSubs) {
        if (!bestSubs.has(sub.challengeId)) {
            bestSubs.set(sub.challengeId, sub);
        }
    }
    
    const results = contestChalls.map(c => {
        const sub = bestSubs.get(c.id);
        return {
            challenge: c,
            submission: sub ? {
                ...sub,
                // Ensure plain objects
                score: Number(sub.score),
                accuracy: Number(sub.accuracy),
                chars: sub.code.length, // Computed from code
                duration: 0, // Default since column might be missing
                createdAt: sub.createdAt
            } : null
        };
    });

    return { success: true, results };

  } catch (error) {
    console.error("Error in getContestUserSubmissionsAction:", error);
    // Return specific error message for debugging
    return { success: false, error: error instanceof Error ? error.message : "Failed to load submissions" };
  }
}
