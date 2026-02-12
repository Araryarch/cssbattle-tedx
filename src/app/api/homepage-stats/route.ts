import { NextResponse } from "next/server";
import { db } from "@/db";
import { contests, submissions } from "@/db/schema";
import { desc, eq, and, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const activeContest = await db.query.contests.findFirst({
      where: and(eq(contests.isActive, true), gt(contests.endTime, now)),
      orderBy: [desc(contests.startTime)],
    });

    let topScore = 0;
    const topSubmission = await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.score))
      .limit(1);

    if (topSubmission.length > 0) {
      topScore = parseInt(topSubmission[0].score);
    }

    return NextResponse.json({ activeContest, topScore });
  } catch (error) {
    console.error("Error fetching homepage stats:", error);
    return NextResponse.json(
      { activeContest: null, topScore: 0 },
      { status: 500 }
    );
  }
}
