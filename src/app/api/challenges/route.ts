import { NextResponse } from "next/server";
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isHidden, false))
      .orderBy(desc(challenges.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json([], { status: 500 });
  }
}
