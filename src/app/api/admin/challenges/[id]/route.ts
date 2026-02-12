import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { eq } from "drizzle-orm";

// DELETE /api/admin/challenges/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(challenges).where(eq(challenges.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete challenge error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
