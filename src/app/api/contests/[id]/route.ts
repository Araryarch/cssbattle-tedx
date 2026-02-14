import { NextResponse } from "next/server";
import { db } from "@/db";
import { contests, challenges, contestChallenges, contestParticipants } from "@/db/schema";
import { eq, asc, inArray, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contestId } = await params;

    const contest = await db.query.contests.findFirst({
      where: eq(contests.id, contestId),
    });

    const session = await verifySession();
    
    let isJoined = false;
    if (session?.userId) {
        const participant = await db.query.contestParticipants.findFirst({
            where: and(
                eq(contestParticipants.contestId, contestId),
                eq(contestParticipants.userId, session.userId)
            )
        });
        isJoined = !!participant;
    }

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    // Fetch challenges in this contest, ordered by 'order'
    const challengesList = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        difficulty: challenges.difficulty,
        imageUrl: challenges.imageUrl,
        targetCode: challenges.targetCode,
        description: challenges.description,
        colors: challenges.colors,
        defaultCode: challenges.defaultCode,
        tips: challenges.tips,
        order: contestChallenges.order,
      })
      .from(challenges)
      .innerJoin(
        contestChallenges,
        eq(challenges.id, contestChallenges.challengeId)
      )
      .where(eq(contestChallenges.contestId, contestId))
      .orderBy(asc(contestChallenges.order));

    return NextResponse.json({
      ...contest,
      challenges: challengesList,
      isJoined,
    });
  } catch (error) {
    console.error("Error fetching contest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
