import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contests, contestChallenges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getContestLeaderboardAction } from "@/lib/submission-actions";

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

    // Get all challenge IDs in this contest (for count)
    const contestChallengeLinks = await db
      .select({ challengeId: contestChallenges.challengeId })
      .from(contestChallenges)
      .where(eq(contestChallenges.contestId, contestId));

    const totalChallenges = contestChallengeLinks.length;

    // Fetch Leaderboard (Unified logic)
    const leaderboardData = await getContestLeaderboardAction(contestId);

    // Map to API response format
    const leaderboard = leaderboardData.map((entry) => ({
      userId: entry.userId,
      userName: entry.userName || "Anonymous",
      userImage: entry.userImage,
      totalScore: entry.totalScore,
      challengesCompleted: entry.challengesSolved,
      lastSubmissionTime: entry.lastSubmissionAt, // Date object, Next.json handles it? or toISOString()
      rank: entry.rank,
    }));

    return NextResponse.json({
      contest: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        isActive: contest.isActive,
      },
      totalChallenges,
      leaderboard,
    });
  } catch (error) {
    console.error("Contest results API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
