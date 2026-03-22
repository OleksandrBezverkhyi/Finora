import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/analytics",
  "/budgets",
  "/goals",
  "/planning",
  "/import-export",
  "/profile",
];

function isProtectedPath(pathname) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/analytics/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/planning/:path*",
    "/import-export/:path*",
    "/profile/:path*",
  ],
};
