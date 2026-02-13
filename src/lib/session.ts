import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "default_secret_please_change");
const ALG = "HS256";

export type SessionPayload = {
    userId: string;
    email: string;
    role: "admin" | "user";
    isAuth: boolean;
    [key: string]: any;
};

export async function signSession(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d") // Session valid for 7 days
    .sign(JWT_SECRET);
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const tokenToVerify = token || cookieStore.get("auth-token")?.value;

  if (!tokenToVerify) return null;
  try {
    const { payload } = await jwtVerify(tokenToVerify, JWT_SECRET);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}
