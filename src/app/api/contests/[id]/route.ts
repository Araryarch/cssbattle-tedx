import { NextResponse } from "next/server";
import { db } from "@/db";
import { contests, challenges, contestChallenges } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

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
    });
  } catch (error) {
    console.error("Error fetching contest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
