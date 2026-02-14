import { NextResponse } from "next/server";
import { db } from "@/db";
import { voiceParticipants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db.delete(voiceParticipants).where(eq(voiceParticipants.userId, payload.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave voice error:", error);
    return NextResponse.json({ error: "Failed to leave" }, { status: 500 });
  }
}
