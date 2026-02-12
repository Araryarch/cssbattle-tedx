"use server";

import { db } from "@/db";
import { contests, submissions } from "@/db/schema";
import { desc, eq, and, gt } from "drizzle-orm";

export async function getHomepageStatsAction() {
  try {
    const now = new Date();
    // Get the most relevant active contest (running now, or coming soon)
    const activeContest = await db.query.contests.findFirst({
        where: and(
            eq(contests.isActive, true),
            gt(contests.endTime, now)
        ),
        orderBy: [desc(contests.startTime)]
    });

    let topScore = 0;
    
    // Get global top score or contest top score
    // For now, let's get the absolute highest score submission ever
    const topSubmission = await db.select().from(submissions).orderBy(desc(submissions.score)).limit(1);
    if (topSubmission.length > 0) {
        topScore = parseInt(topSubmission[0].score);
    }

    return {
        activeContest,
        topScore
    };
  } catch (error) {
    console.error("Error fetching homepage stats:", error);
    return { activeContest: null, topScore: 0 };
  }
}

export async function getActiveContestsAction() {
  const now = new Date();
  try {
    return await db
      .select()
      .from(contests)
      .where(eq(contests.isActive, true))
      .orderBy(desc(contests.startTime));
  } catch (error) {
    console.error("Error fetching active contests:", error);
    return [];
  }
}
