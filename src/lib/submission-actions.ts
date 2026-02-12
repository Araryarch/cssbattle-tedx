"use server";

import { db } from "@/db";
import { submissions, users, challenges } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

// Update saveSubmissionAction signature
export async function saveSubmissionAction(data: {
  challengeId: string;
  code: string;
  accuracy: number;
  score: number;
  duration: number; // New field
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

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

    const id = crypto.randomUUID();
    await db.insert(submissions).values({
      id,
      userId: session.userId as string,
      challengeId: data.challengeId,
      code: data.code,
      accuracy: data.accuracy.toString(),
      score: data.score.toString(),
      duration: data.duration,
      chars: data.code.length, // Save code breakdown
    });

    revalidatePath(`/battle/${data.challengeId}`);
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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

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

    return {
      best: best ? { ...best, score: Number(best.score), accuracy: Number(best.accuracy), duration: best.duration || 0, chars: best.chars || 0 } : null,
      latest: latest ? { ...latest, score: Number(latest.score), accuracy: Number(latest.accuracy), duration: latest.duration || 0, chars: latest.chars || 0 } : null
    };
  } catch (error) {
    console.error("Database error in getUserChallengeStatsAction:", error);
    return null;
  }
}
// Admin: Get All Submissions (paginated)
export async function getAllSubmissionsAction(page = 1, limit = 50) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

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

// Helper: Check if user has a valid submission for a challenge
async function hasUserSolvedChallenge(userId: string, challengeId: string) {
  const [submission] = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(sql`${submissions.userId} = ${userId} AND ${submissions.challengeId} = ${challengeId} AND CAST(${submissions.score} AS REAL) > 0`)
    .limit(1);
  return !!submission;
}

// Global Leaderboard (Sum of best scores per challenge)
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
        totalScore: sql<number>`SUM(${maxScores.maxScore})`,
        challengesSolved: sql<number>`COUNT(${maxScores.challengeId})`,
      })
      .from(maxScores)
      .leftJoin(users, eq(maxScores.userId, users.id))
      .groupBy(maxScores.userId, users.name, users.email)
      .orderBy(sql`${sql`SUM(${maxScores.maxScore})`} DESC`)
      .limit(limit);

    // Calculate Rank Title based on score - 8flex to 1flex (more points = closer to 1flex)
    return leaderboard.map((l, i) => {
        const score = Number(l.totalScore);
        let rankTitle = "8flex";
        
        if (score >= 8000) rankTitle = "1flex";
        else if (score >= 6000) rankTitle = "2flex";
        else if (score >= 4000) rankTitle = "3flex";
        else if (score >= 2500) rankTitle = "4flex";
        else if (score >= 1500) rankTitle = "5flex";
        else if (score >= 800) rankTitle = "6flex";
        else if (score >= 300) rankTitle = "7flex";
        
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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

    if (!session?.userId) {
       return { authorized: false, solutions: [] };
    }

    // Check if user solved it (or is admin)
    const solved = await hasUserSolvedChallenge(session.userId as string, challengeId);
    if (!solved && session.role !== 'admin') {
       return { authorized: false, solutions: [] };
    }

    // Return all submissions for this challenge with user info
    // Order by Highest Score, then Time
    const solutions = await db
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
      .where(eq(submissions.challengeId, challengeId))
      .orderBy(desc(sql`CAST(${submissions.score} AS REAL)`), desc(submissions.createdAt))
      .limit(50); // Limit to top 50 

    return { authorized: true, solutions };
  } catch (error) {
    console.error("Database error in getChallengeSolutionsAction:", error);
    return { authorized: false, solutions: [] };
  }
}
