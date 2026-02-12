"use server";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function getCommentsAction(submissionId: string) {
  try {
    return await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        userId: comments.userId,
        userName: users.name,
        userImage: users.image,
        parentId: comments.parentId,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.submissionId, submissionId))
      .orderBy(desc(comments.createdAt));
  } catch (error) {
    console.error("Database error in getCommentsAction:", error);
    return [];
  }
}

export async function postCommentAction(submissionId: string, content: string, parentId?: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const session = await verifySession(token);

    if (!session?.userId) {
      return { error: "Unauthorized" };
    }

    if (!content.trim()) {
      return { error: "Comment cannot be empty" };
    }

    const id = crypto.randomUUID();
    await db.insert(comments).values({
      id,
      userId: session.userId as string,
      submissionId,
      content: content.trim(),
      parentId,
    });

    revalidatePath(`/battle/[id]/solutions`); // Revalidate solutions page if needed
    return { success: true, id };
  } catch (error) {
    console.error("Database error in postCommentAction:", error);
    return { error: "Failed to post comment" };
  }
}
