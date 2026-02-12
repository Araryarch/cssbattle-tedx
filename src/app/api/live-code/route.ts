import { NextRequest, NextResponse } from "next/server";
import { liveCodeStore } from "@/lib/live-store";

// POST /api/live-code — User broadcasts their current code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, challengeId, challengeTitle, contestId, code } = body;

    if (!userId || !challengeId || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: userId, challengeId, code" },
        { status: 400 }
      );
    }

    liveCodeStore.update({
      userId,
      userName: userName || "Anonymous",
      challengeId,
      challengeTitle: challengeTitle || `Challenge ${challengeId}`,
      contestId,
      code,
      lastUpdate: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Live code POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/live-code — Get all active coding sessions
export async function GET() {
  try {
    const active = liveCodeStore.getActive();
    return NextResponse.json({ users: active });
  } catch (error) {
    console.error("Live code GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
