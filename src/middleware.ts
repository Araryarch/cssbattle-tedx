import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/verify", "/api/auth"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Skip static files and Next.js internals
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(route + "/")
  );

  // Better Auth session cookie names
  const sessionToken = req.cookies.get("better-auth.session_token")?.value;
  const hasSession = !!sessionToken;

  if (isPublicRoute) {
    // If already logged in and visiting /login, redirect to home
    if (path === "/login" && hasSession) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // For protected routes, redirect to login if no session
  if (!hasSession) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
