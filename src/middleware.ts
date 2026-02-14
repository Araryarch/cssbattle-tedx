import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/login", "/register", "/verify", "/api/auth"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Skip static files
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(route + "/")
  );

  if (isPublicRoute) {
    // If already logged in and visiting /login, redirect to home
    if (path === "/login") {
      const session = await auth.api.getSession({
        headers: { cookie: req.headers.get("cookie") || "" }
      });
      
      if (session) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
      }
    }
    return NextResponse.next();
  }

  // For protected routes, verify session using better-auth
  const session = await auth.api.getSession({
    headers: { cookie: req.headers.get("cookie") || "" }
  });

  if (!session) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
