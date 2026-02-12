import { db } from "@/db";
import { users } from "@/db/schema";
import { comparePassword } from "@/lib/auth-utils";
import { signSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    let user;
    try {
      user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
    } catch (dbErr) {
      console.error("DB query error:", dbErr);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Your account has not been verified by an admin yet" },
        { status: 403 }
      );
    }

    // Create JWT session (include role for middleware redirects)
    const sessionToken = await signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => i.message).join(". ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
