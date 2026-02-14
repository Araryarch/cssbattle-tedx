import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

async function requireAdmin() {
  const payload = await verifySession();
  if (!payload || !payload.userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

const verifyUserSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = verifyUserSchema.parse(body);

    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: "User verified successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => i.message).join(". ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    console.error("Admin verify user error:", error);
    return NextResponse.json(
      { error: "Failed to verify user" },
      { status: 500 }
    );
  }
}

