import { NextResponse } from "next/server";
import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET /api/leaderboard — Get global leaderboard
export async function GET() {
  try {
    const results = await db
      .select({
        userId: submissions.userId,
        name: users.name,
        image: users.image,
        totalScore: sql<number>`sum(cast(${submissions.score} as numeric))`,
        battlesPlayed: sql<number>`count(${submissions.id})`,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .groupBy(submissions.userId, users.name, users.image)
      .orderBy(sql`sum(cast(${submissions.score} as numeric)) desc`)
      .limit(100);

    return NextResponse.json({
      leaderboard: results.map((r) => ({
        userId: r.userId,
        name: r.name,
        image: r.image,
        totalScore: Number(r.totalScore),
        battlesPlayed: Number(r.battlesPlayed),
      })),
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
