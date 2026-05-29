import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const businessRoutes = [
  "/dashboard",
  "/appointments",
  "/customers",
  "/messages",
  "/settings",
  "/onboarding",
];

const adminRoutes = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  const isBusinessRoute = businessRoutes.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  const isAdminRoute = adminRoutes.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  if (isAuthRoute && isLoggedIn) {
    if (session.user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if ((isBusinessRoute || isAdminRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && session?.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isBusinessRoute && session?.user.role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isBusinessRoute && !session?.user.businessId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/customers/:path*",
    "/messages/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
