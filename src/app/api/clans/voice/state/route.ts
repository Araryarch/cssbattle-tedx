import { NextResponse } from "next/server";
import { db } from "@/db";
import { voiceParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isMuted, isCameraOn, channelId } = await request.json();

    if (isMuted === undefined && isCameraOn === undefined) {
      return NextResponse.json({ error: "No state to update" }, { status: 400 });
    }

    const updates: Partial<{ isMuted: boolean; isCameraOn: boolean }> = {};
    if (isMuted !== undefined) updates.isMuted = isMuted;
    if (isCameraOn !== undefined) updates.isCameraOn = isCameraOn;

    await db
      .update(voiceParticipants)
      .set(updates)
      .where(and(
        eq(voiceParticipants.userId, payload.userId),
        eq(voiceParticipants.channelId, channelId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update voice state error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
