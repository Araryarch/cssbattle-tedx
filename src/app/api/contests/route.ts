import { NextResponse } from "next/server";
import { db } from "@/db";
import { contests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(contests)
      .orderBy(desc(contests.startTime));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching contests:", error);
    return NextResponse.json([], { status: 500 });
  }
}
