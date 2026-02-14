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

  // OPTIMISTIC SESSION CHECK (Middleware runs on Edge, no DB access)
  // We check for the session cookie presence. Actual verification happens in Server Components.
  // Better Auth default cookie is usually "better-auth.session_token".
  // supporting potentially "session_token" as well just in case.
  const sessionCookie = req.cookies.get("better-auth.session_token") || req.cookies.get("session_token");
  const hasSession = !!sessionCookie?.value;

  // We can't know the role solely from the cookie without decoding/DB.
  // So we skip role-based redirects in middleware or use a separate unencrypted cookie if available.
  // For now, we'll assume "user" role in middleware and let Layout/Page handle "admin" protection/redirects.
  // OR, if we really need role, we could inspect a non-httpOnly cookie if one exists, but for security we shouldn't trust it blindly.
  // Let's rely on Server Components for strict Admin protection.
  
  const role = "user" as string; // Placeholder, real check in page

  // Check if the current route is public
  const isPublicRoute = 
    publicRoutes.some((route) => path === route || path.startsWith(route + "/")) ||
    publicApiRoutes.some((route) => path.startsWith(route));

  // If not public and no session, redirect to login
  if (!isPublicRoute && !hasSession) {
    console.log(`Middleware Redirect: No session for ${path} -> /login`);
    const loginUrl = new URL("/login", req.nextUrl);
    // Optional: Add redirect param to return after login
    // loginUrl.searchParams.set("redirect", path); 
    return NextResponse.redirect(loginUrl);
  }

  // If visiting auth page (login/register) while logged in, redirect to appropriate home
  if (authRoutes.some(r => path === r) && hasSession) {
     const target = role === "admin" ? "/admin" : "/dashboard";
     console.log(`Middleware Redirect: Already logged in, visiting ${path} -> ${target}`);
     return NextResponse.redirect(new URL(target, req.nextUrl));
  }

  // Admin route protection
  if (path.startsWith("/admin")) {
    if (!hasSession) {
       return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    // Cannot check Role here securely without DB. 
    // Allowing request to proceed; /admin Layout must handle role verification.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
