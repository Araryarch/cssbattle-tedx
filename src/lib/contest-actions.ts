"use server";

import { db } from "@/db";
import { contests, contestChallenges, challenges, contestParticipants, users, contestLeaderboard } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

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

export async function startContestAction(id: string) {
    try {
        const [contest] = await db.select().from(contests).where(eq(contests.id, id));
        if (!contest) return { success: false, error: "Contest not found" };

        const now = new Date();
        let updateData: any = { isActive: true, updatedAt: now };

        // If contest has ended, extend it by 1 hour from now to make it playable
        if (contest.endTime && new Date(contest.endTime) <= now) {
            updateData.endTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
        }

        await db.update(contests)
            .set(updateData)
            .where(eq(contests.id, id));

        revalidatePath("/admin/contests");
        revalidatePath(`/contest`);
        return { success: true };
    } catch (error) {
        console.error("Error starting contest:", error);
        return { success: false, error: "Failed to start contest" };
    }
}

export async function stopContestAction(id: string) {
    try {
        await db.update(contests)
            .set({ endTime: new Date(), isActive: false, updatedAt: new Date() })
            .where(eq(contests.id, id));
        revalidatePath("/admin/contests");
        revalidatePath(`/contest`);
        return { success: true };
    } catch (error) {
        console.error("Error stopping contest:", error);
        return { success: false, error: "Failed to stop contest" };
    }
}

// Keep backward compat alias
export const endContestAction = stopContestAction;

export async function joinContestAction(contestId: string) {
    try {
        const session = await verifySession();

        if (!session?.userId) return { success: false, error: "Unauthorized" };
        const userId = session.userId as string;

        // 1. Explicit check to prevent spam duplicates
        const existing = await db.query.contestParticipants.findFirst({
            where: and(
                eq(contestParticipants.contestId, contestId),
                eq(contestParticipants.userId, userId)
            )
        });

        if (existing) return { success: true };

        // 2. Insert with onConflictDoNothing as secondary safety
        await db.insert(contestParticipants)
            .values({
                contestId,
                userId: userId,
            })
            .onConflictDoNothing();

        // 3. Leaderboard entry
        await db.insert(contestLeaderboard).values({
            contestId: contestId,
            userId: userId,
            totalScore: 0,
            challengesSolved: 0,
            lastSubmissionAt: new Date(0)
        }).onConflictDoNothing();

        revalidatePath(`/contest/${contestId}`);
        return { success: true };
    } catch (error) {
        console.error("Error joining contest:", error);
        return { success: false, error: "Failed to join contest" };
    }
}

export async function getContestParticipantsAction(contestId: string) {
    try {
        // Group by user to ensure uniqueness even if there's duplicate data
        const participants = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                rank: users.rank,
                joinedAt: sql<Date>`min(${contestParticipants.joinedAt})`
            })
            .from(contestParticipants)
            .innerJoin(users, eq(contestParticipants.userId, users.id))
            .where(eq(contestParticipants.contestId, contestId))
            .groupBy(users.id, users.name, users.image, users.rank)
            .orderBy(desc(sql`min(${contestParticipants.joinedAt})`));
        
        return participants;
    } catch (error) {
        console.error("Error fetching participants:", error);
        return [];
    }
}
