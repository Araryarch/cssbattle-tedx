import { NextResponse } from "next/server";
import { db } from "@/db";
import { clans, clanMembers, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const allClans = await db
      .select({
        id: clans.id,
        name: clans.name,
        description: clans.description,
        ownerId: clans.ownerId,
        memberCount: sql<number>`count(${clanMembers.id})`,
      })
      .from(clans)
      .leftJoin(clanMembers, eq(clans.id, clanMembers.clanId))
      .groupBy(clans.id);

    return NextResponse.json({ clans: allClans });
  } catch (error) {
    console.error("Get all clans error:", error);
    return NextResponse.json({ error: "Failed to get clans" }, { status: 500 });
  }
}
