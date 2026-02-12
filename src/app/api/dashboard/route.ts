import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { submissions, users, contests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/session";

// GET /api/dashboard — Get current user's dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session?.isAuth || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId as string;

    // Fetch user submissions
    const userSubmissions = await db.query.submissions.findMany({
      where: eq(submissions.userId, userId),
      orderBy: [desc(submissions.createdAt)],
      limit: 10,
    });

    // Calculate stats
    const totalSubmissions = userSubmissions.length;
    const uniqueChallenges = new Set(userSubmissions.map((s) => s.challengeId)).size;

    const validAccuracies = userSubmissions
      .map((s) => parseFloat(s.accuracy))
      .filter((acc) => !isNaN(acc));

    const avgAccuracy =
      validAccuracies.length > 0
        ? (validAccuracies.reduce((a, b) => a + b, 0) / validAccuracies.length).toFixed(1)
        : "0.0";

    const totalScore = userSubmissions
      .reduce((acc, curr) => acc + parseFloat(curr.score), 0)
      .toFixed(0);

    // Fetch active contests
    const activeContests = await db.query.contests.findMany({
      where: eq(contests.isActive, true),
      orderBy: [desc(contests.createdAt)],
      limit: 2,
    });

    return NextResponse.json({
      stats: {
        totalScore,
        avgAccuracy,
        uniqueChallenges,
        totalSubmissions,
      },
      recentSubmissions: userSubmissions.map((s) => ({
        id: s.id,
        challengeId: s.challengeId,
        score: s.score,
        accuracy: s.accuracy,
        createdAt: s.createdAt,
      })),
      activeContests: activeContests.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        startTime: c.startTime,
        endTime: c.endTime,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
