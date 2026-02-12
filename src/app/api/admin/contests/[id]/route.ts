import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contests } from "@/db/schema";
import { eq } from "drizzle-orm";

// DELETE /api/admin/contests/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(contests).where(eq(contests.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete contest error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
