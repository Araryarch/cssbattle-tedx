import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contests, submissions, users, contestChallenges } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/contests/[id]/results — Get contest leaderboard/results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    // Get contest details
    const contest = await db.query.contests.findFirst({
      where: eq(contests.id, contestId),
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    // Get all challenge IDs in this contest
    const contestChallengeLinks = await db
      .select({ challengeId: contestChallenges.challengeId })
      .from(contestChallenges)
      .where(eq(contestChallenges.contestId, contestId));

    const challengeIds = contestChallengeLinks.map((c) => c.challengeId);

    if (challengeIds.length === 0) {
      return NextResponse.json({
        contest: {
          id: contest.id,
          title: contest.title,
          description: contest.description,
          startTime: contest.startTime,
          endTime: contest.endTime,
          isActive: contest.isActive,
        },
        totalChallenges: 0,
        leaderboard: [],
      });
    }

    // Fetch all submissions for contest challenges
    const allSubmissions = await db
      .select({
        userId: submissions.userId,
        score: submissions.score,
        challengeId: submissions.challengeId,
        createdAt: submissions.createdAt,
        userName: users.name,
        userImage: users.image,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .where(
        sql`${submissions.challengeId} IN ${challengeIds}`
      );

    // Process: best score per challenge per user
    const userBestScores: Record<string, { [challengeId: string]: number }> = {};
    const userDetails: Record<string, { name: string; image: string | null; lastSub: string }> = {};

    allSubmissions.forEach((sub) => {
      if (!sub.userId || !sub.userName) return;

      if (!userBestScores[sub.userId]) {
        userBestScores[sub.userId] = {};
        userDetails[sub.userId] = {
          name: sub.userName,
          image: sub.userImage,
          lastSub: sub.createdAt.toISOString(),
        };
      }

      const currentScore = parseFloat(sub.score);
      const existingBest = userBestScores[sub.userId][sub.challengeId] || 0;

      if (currentScore > existingBest) {
        userBestScores[sub.userId][sub.challengeId] = currentScore;
      }

      if (sub.createdAt.toISOString() > userDetails[sub.userId].lastSub) {
        userDetails[sub.userId].lastSub = sub.createdAt.toISOString();
      }
    });

    // Build leaderboard
    const leaderboard = Object.keys(userBestScores)
      .map((userId) => {
        const scores = Object.values(userBestScores[userId]);
        const totalScore = scores.reduce((a, b) => a + b, 0);
        return {
          userId,
          userName: userDetails[userId].name,
          userImage: userDetails[userId].image,
          totalScore: Math.round(totalScore * 100) / 100,
          challengesCompleted: scores.length,
          lastSubmissionTime: userDetails[userId].lastSub,
        };
      })
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.lastSubmissionTime.localeCompare(b.lastSubmissionTime);
      })
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return NextResponse.json({
      contest: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        isActive: contest.isActive,
      },
      totalChallenges: challengeIds.length,
      leaderboard,
    });
  } catch (error) {
    console.error("Contest results API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
