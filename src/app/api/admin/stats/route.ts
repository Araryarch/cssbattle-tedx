import { NextResponse } from "next/server";
import { db } from "@/db";
import { challenges, users, submissions } from "@/db/schema";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    const [challengesCount, usersCount, submissionsCount] = await Promise.all([
      db.select({ count: count() }).from(challenges).then(res => res[0]?.count || 0),
      db.select({ count: count() }).from(users).then(res => res[0]?.count || 0),
      db.select({ count: count() }).from(submissions).then(res => res[0]?.count || 0),
    ]);

    return NextResponse.json({
      challengesCount,
      usersCount,
      submissionsCount,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
