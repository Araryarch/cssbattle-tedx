import { db } from "@/db";
import { users } from "@/db/schema";
import { verifySession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifySession(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ user: null });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        isVerified: true,
        role: true,
      },
    });

    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    // Don't fail hard on me endpoint, just return null user
    return NextResponse.json({ user: null });
  }
}
