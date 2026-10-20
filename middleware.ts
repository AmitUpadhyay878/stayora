import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = [/^\/wishlist(?:\/|$)/, /^\/bookings(?:\/|$)/, /^\/account(?:\/|$)/];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((pattern) => pattern.test(pathname));
  if (!needsAuth) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/wishlist/:path*", "/bookings/:path*", "/account/:path*"],
};
