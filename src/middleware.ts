import { verifySession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// 1. Define public routes that don't need authentication
const publicRoutes = ["/login", "/register", "/verify"];
const publicApiRoutes = ["/api/auth"];

// 2. Define routes that redirect to dashboard if already logged in
const authRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Debug log to trace requests
  console.log(`Middleware: ${req.method} ${path}`);

  // Make session verification optional/lighter to avoid performance hit on every request if possible
  const session = await verifySession();
  
  const role =
    (session && typeof session === "object" && "role" in session
      ? (session as { role?: string }).role
      : undefined) as "admin" | "user" | undefined;

  // Check if the current route is public
  const isPublicRoute = 
    publicRoutes.some((route) => path === route || path.startsWith(route + "/")) ||
    publicApiRoutes.some((route) => path.startsWith(route));

  // If not public and no session, redirect to login
  if (!isPublicRoute && !session) {
    console.log(`Middleware Redirect: No session for ${path} -> /login`);
    const loginUrl = new URL("/login", req.nextUrl);
    // Optional: Add redirect param to return after login
    // loginUrl.searchParams.set("redirect", path); 
    return NextResponse.redirect(loginUrl);
  }

  // If visiting auth page (login/register) while logged in, redirect to appropriate home
  if (authRoutes.some(r => path === r) && session) {
     const target = role === "admin" ? "/admin" : "/dashboard";
     console.log(`Middleware Redirect: Already logged in, visiting ${path} -> ${target}`);
     return NextResponse.redirect(new URL(target, req.nextUrl));
  }

  // Admin route protection
  if (path.startsWith("/admin")) {
    if (role !== "admin") {
      console.log(`Middleware Redirect: User trying to access admin -> /dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  // Explicitly ALLOW /socials to proceed
  if (path.startsWith("/socials")) {
      console.log(`Middleware: Explicitly allowing /socials`);
      return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
