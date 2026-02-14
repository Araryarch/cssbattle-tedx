import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Cek admin berdasarkan role di tabel user
async function requireAdmin() {
  const payload = await verifySession();
  if (!payload || !payload.userId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingUsers = await db.query.users.findMany({
      where: eq(users.isVerified, false),
      columns: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        role: true,
      },
    });

    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error("Admin pending users error:", error);
    return NextResponse.json(
      { error: "Failed to load pending users" },
      { status: 500 }
    );
  }
}

