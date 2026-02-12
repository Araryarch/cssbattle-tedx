import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
    } catch (dbErr) {
      console.error("DB query error:", dbErr);
      return NextResponse.json(
        { error: "Database connection failed. Please contact admin." },
        { status: 503 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    try {
      await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
        // isVerified akan tetap false sampai admin memverifikasi
      });
    } catch (dbErr) {
      console.error("DB write error:", dbErr);
      return NextResponse.json(
        { error: "Failed to create account. Database error." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      message:
        "Account created successfully. Please wait for admin to verify your account.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((i) => i.message).join(". ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    console.error("Register Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Registration failed unexpectedly",
      },
      { status: 500 }
    );
  }
}
