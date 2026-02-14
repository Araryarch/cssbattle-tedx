import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type SessionPayload = {
    userId: string;
    email: string;
    role: "admin" | "user";
    isAuth: boolean;
    image?: string | null;
    name?: string | null;
    [key: string]: any;
};

export async function signSession(payload: any): Promise<string> {
  // Deprecated or used for legacy? Keeping blank or throwing to find usage.
  // Better Auth handles session signing.
  return ""; 
}

export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    return {
        userId: session.user.id,
        email: session.user.email,
        role: (session.user as any).role || "user", // Type assertion until fully typed
        isAuth: true,
        image: session.user.image,
        name: session.user.name,
    };
  } catch (error) {
    return null;
  }
}
