"use server";

import { db } from "@/db";
import { users, submissions, challenges } from "@/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { uploadProfileImage } from "@/lib/storage";
import { getRankTitle } from "@/lib/utils";


export async function updateUserRankAction(userId: string) {
    try {
        const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
        if (!user) return;
        
        await db.update(users)
          .set({
             rank: sql`(
                SELECT CASE 
                    WHEN ${user.role} = 'admin' THEN 'dev'
                    WHEN SUM(max_scores.val) >= 15000 THEN '1grid'
                    WHEN SUM(max_scores.val) >= 10000 THEN '1flex'
                    WHEN SUM(max_scores.val) >= 7500 THEN '2flex'
                    WHEN SUM(max_scores.val) >= 5000 THEN '3flex'
                    WHEN SUM(max_scores.val) >= 3500 THEN '4flex'
                    WHEN SUM(max_scores.val) >= 2000 THEN '5flex'
                    WHEN SUM(max_scores.val) >= 1000 THEN '6flex'
                    WHEN SUM(max_scores.val) >= 500 THEN '7flex'
                    ELSE '8flex'
                END
                FROM (
                    SELECT MAX(CAST(score AS REAL)) as val
                    FROM submissions
                    WHERE user_id = ${userId}
                    GROUP BY challenge_id
                ) AS max_scores
             )`
          })
          .where(eq(users.id, userId));

    } catch (error) {
        console.error("Failed to update user rank:", error);
    }
}


export async function getUserDetailsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);
    if (!session?.userId) return null;
    
    const [user] = await db.select().from(users).where(eq(users.id, session.userId as string));
    if (!user) return null;

    // Calculate rank on the fly to ensure accuracy
    const maxScores = db
        .select({
            maxScore: sql<number>`MAX(CAST(${submissions.score} AS REAL))`.as('max_score'),
        })
        .from(submissions)
        .where(eq(submissions.userId, user.id))
        .groupBy(submissions.challengeId)
        .as('max_scores');

    const [scoreData] = await db
        .select({ totalScore: sql<number>`COALESCE(SUM(${maxScores.maxScore}), 0)` })
        .from(maxScores);

    const totalScore = Number(scoreData?.totalScore || 0);
    const rank = getRankTitle(totalScore, user.role);
    
    return { ...user, rank };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}

export async function updateUserAction(data: { name?: string; image?: string }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

    if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    try {
        await db.update(users)
            .set({
                ...(data.name ? { name: data.name } : {}),
                ...(data.image ? { image: data.image } : {}),
            })
            .where(eq(users.id, session.userId as string));
        
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { error: "Failed to update profile" };
    }
}

export async function uploadAvatarAction(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

     if (!session?.userId) {
        return { error: "Unauthorized" };
    }

    try {
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file uploaded");

        const publicUrl = await uploadProfileImage(file);
        return { publicUrl };
    } catch (error) {
        console.error("Avatar upload failed:", error);
        return { error: "Upload failed" };
    }
}

export async function getUsersAction() {
  try {
    return await db.select().from(users).orderBy(users.name);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function updateUserVerificationAction(userId: string, isVerified: boolean) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

    if (!session?.userId || session.role !== "admin") {
       return { error: "Unauthorized" };
    }

    await db.update(users)
        .set({ isVerified })
        .where(eq(users.id, userId));
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
      console.error("Failed to verify user:", error);
      return { error: "Failed to update verification" };
  }
}

export async function getUserCompletedChallengesAction() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        const session = await verifySession(token);

        if (!session?.userId) return [];

        const completed = await db
            .select({
                id: challenges.id,
                title: challenges.title,
                imageUrl: challenges.imageUrl,
                score: submissions.score,
                accuracy: submissions.accuracy,
                createdAt: submissions.createdAt
            })
            .from(submissions)
            .leftJoin(challenges, eq(submissions.challengeId, challenges.id))
            .where(eq(submissions.userId, session.userId as string))
            .orderBy(desc(submissions.createdAt));

        // Let's filter in JS to keep latest unique
        const unique = new Map<string, typeof completed[0]>();
        for (const item of completed) {
            if (item.id && !unique.has(item.id)) {
                unique.set(item.id, item);
            }
        }

        return Array.from(unique.values());
    } catch (error) {
        console.error("Failed to fetch completed challenges:", error);
        return [];
    }
}
// Admin: Get users eligible for certificates
export async function getEligibleCertificateUsersAction() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        const session = await verifySession(token);

        if (!session?.userId || session.role !== "admin") {
             return [];
        }

        const eligibleRanks = ["dev", "1grid", "1flex", "2flex", "3flex", "4flex"];
        
        return await db
            .select()
            .from(users)
            .where(inArray(users.rank, eligibleRanks))
            .orderBy(desc(users.rank));
    } catch (error) {
        console.error("Failed to fetch eligible users:", error);
        return [];
    }
}
