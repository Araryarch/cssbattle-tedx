import { NextResponse } from "next/server";
import { db } from "@/db";
import { clanMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/session";
import { addSignal } from "@/lib/signal-store";

export async function POST(request: Request) {
  try {
    const payload = await verifySession();
    if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clanId, signal, toUserId } = await request.json();

    if (!clanId || !signal) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify membership
    const member = await db.select().from(clanMembers).where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.userId, payload.userId))).then(res => res[0]);
    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Add signal to store (DB now)
    await addSignal(clanId, {
      fromUserId: payload.userId,
      toUserId: toUserId || null, // Ensure null if undefined
      signal, 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
