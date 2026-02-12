"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { uploadProfileImage } from "@/lib/storage";

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
