import { NextResponse } from "next/server";
import { db } from "@/db";
import { contests } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET /api/admin/contests — Get all contests for admin
export async function GET() {
  try {
    const contestsList = await db.query.contests.findMany({
      orderBy: [desc(contests.createdAt)],
    });

    return NextResponse.json({ contests: contestsList });
  } catch (error) {
    console.error("Admin contests API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
