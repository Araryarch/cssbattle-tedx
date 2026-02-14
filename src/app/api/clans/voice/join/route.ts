import { NextResponse } from "next/server";
import { db } from "@/db";
import { voiceParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clanId, channelId } = await request.json();

    if (!clanId || !channelId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Remove from other channels first (user can only be in one voice channel)
    await db
      .delete(voiceParticipants)
      .where(eq(voiceParticipants.userId, payload.userId));

    // Join new channel
    await db.insert(voiceParticipants).values({
      userId: payload.userId,
      clanId,
      channelId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Join voice error:", error);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
