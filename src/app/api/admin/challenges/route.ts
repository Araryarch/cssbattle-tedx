import { NextResponse } from "next/server";
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET /api/admin/challenges — Get all challenges (including hidden) for admin
export async function GET() {
  try {
    const challengesList = await db.query.challenges.findMany({
      orderBy: [desc(challenges.createdAt)],
    });

    return NextResponse.json({ challenges: challengesList });
  } catch (error) {
    console.error("Admin challenges API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
