"use server";

import { db } from "@/db";
import { challenges, submissions } from "@/db/schema";
import { Challenge } from "@/lib/challenges";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getChallengesAction() {
  try {
    const result = await db.select().from(challenges);
    return result;
  } catch (error) {
    console.error("Database error in getChallengesAction:", error);
    return [];
  }
}

export async function getChallengeAction(id: string) {
  try {
    const challengeResult = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id));
      
    const challengeData = challengeResult[0] || null;
    if (!challengeData) return null;

    // Aggregate stats
    const statsResult = await db
      .select({
        avgAccuracy: sql<number>`AVG(CAST(${submissions.accuracy} AS FLOAT))`,
        avgChars: sql<number>`AVG(LENGTH(${submissions.code}))`,
        avgDuration: sql<number>`AVG(${submissions.duration})`, // New duration
        topScore: sql<number>`MAX(CAST(${submissions.score} AS FLOAT))`,
        totalSubmissions: sql<number>`COUNT(*)`
      })
      .from(submissions)
      .where(eq(submissions.challengeId, id));
      
    const stats = statsResult[0] || { avgAccuracy: 0, avgChars: 0, avgDuration: 0, topScore: 0, totalSubmissions: 0 };

    return {
      ...challengeData,
      stats: {
        avgAccuracy: Number(stats.avgAccuracy || 0).toFixed(1),
        avgChars: Math.round(Number(stats.avgChars || 0)),
        avgDuration: Math.round(Number(stats.avgDuration || 0)),
        topScore: Number(stats.topScore || 0),
        totalSubmissions: Number(stats.totalSubmissions || 0)
      }
    };
  } catch (error) {
    console.error("Database error in getChallengeAction:", error);
    return null;
  }
}

export async function createChallengeAction(challenge: Challenge) {
  try {
    await db.insert(challenges).values({
      ...challenge,
      colors: challenge.colors || [],
      targetCode: challenge.targetCode || "",
      targetChars: challenge.targetChars || 200, 
      tips: challenge.tips || [],
      isHidden: challenge.isHidden || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/challenges");
    return { success: true };
  } catch (error) {
    console.error("Database error in createChallengeAction:", error);
    throw error;
  }
}

export async function updateChallengeAction(challenge: Challenge) {
  try {
    const { id, ...data } = challenge;
    
    await db
      .update(challenges)
      .set({
        title: data.title,
        difficulty: data.difficulty,
        colors: data.colors || [],
        defaultCode: data.defaultCode,
        targetCode: data.targetCode,
        targetChars: data.targetChars,
        imageUrl: data.imageUrl,
        description: data.description,
        tips: data.tips || [],
        isHidden: data.isHidden || false,
        updatedAt: new Date(),
      })
      .where(eq(challenges.id, challenge.id));

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/challenges");
    revalidatePath(`/battle/${challenge.id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Database error in updateChallengeAction:", error);
    throw error;
  }
}

export async function deleteChallengeAction(id: string) {
  try {
    const challengeToDelete = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id))
      .limit(1);
    
    if (challengeToDelete.length > 0 && challengeToDelete[0].imageUrl) {
      const { deleteChallengeImage } = await import("@/lib/storage");
      try {
        await deleteChallengeImage(challengeToDelete[0].imageUrl);
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
    
    await db.delete(challenges).where(eq(challenges.id, id));
    
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/challenges");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete challenge:", error);
    throw error;
  }
}
