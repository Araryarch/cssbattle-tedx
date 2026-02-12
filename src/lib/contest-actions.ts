"use server";

import { db } from "@/db";
import { contests, contestChallenges, challenges } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type Contest = {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  challengeIds: string[]; // For form handling
};

export async function getContestsAction() {
  try {
    return await db.select().from(contests).orderBy(desc(contests.createdAt));
  } catch (error) {
    console.error("Error fetching contests:", error);
    return [];
  }
}

export async function getContestAction(id: string) {
    try {
        const contest = await db.query.contests.findFirst({
            where: eq(contests.id, id),
            with: {
                // @ts-ignore - relation needs to be defined in schema or manual join
                // Since we didn't define relations in schema.ts yet, we'll do manual join below
            }
        });

        if (!contest) return null;

        // Manual join to get challenges
        const challengesResult = await db
            .select({
                challengeId: contestChallenges.challengeId,
                order: contestChallenges.order
            })
            .from(contestChallenges)
            .where(eq(contestChallenges.contestId, id))
            .orderBy(contestChallenges.order);

        return {
            ...contest,
            challengeIds: challengesResult.map(c => c.challengeId)
        };
    } catch (error) {
        console.error("Error fetching contest:", error);
        return null;
    }
}

export async function saveContestAction(data: Contest) {
  try {
    const { challengeIds, ...contestData } = data;
    let contestId = data.id;

    if (contestId) {
      // Update
      await db
        .update(contests)
        .set({
          ...contestData,
          updatedAt: new Date(),
        })
        .where(eq(contests.id, contestId));
      
      // Clear existing challenges relations
      await db.delete(contestChallenges).where(eq(contestChallenges.contestId, contestId));

    } else {
      // Create
      contestId = crypto.randomUUID();
      await db.insert(contests).values({
        id: contestId,
        ...contestData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert challenge relations
    if (challengeIds && challengeIds.length > 0) {
      await db.insert(contestChallenges).values(
        challengeIds.map((cId, index) => ({
          contestId: contestId!,
          challengeId: cId,
          order: index,
        }))
      );
    }

    revalidatePath("/admin/contests");
    return { success: true, id: contestId };
  } catch (error) {
    console.error("Error saving contest:", error);
    throw error;
  }
}

export async function deleteContestAction(id: string) {
    try {
        await db.delete(contests).where(eq(contests.id, id));
        revalidatePath("/admin/contests");
        return { success: true };
    } catch (error) {
        console.error("Error deleting contest:", error);
        throw error;
    }
}
