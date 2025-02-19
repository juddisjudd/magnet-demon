import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    ["/login", "/"].includes(path) ||
    path.startsWith("/torrent/") ||
    path.startsWith("/api/torrents") ||
    path.startsWith("/api/tmdb");

  const token = request.cookies.get("token")?.value;

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const verifiedToken = await verifyToken(token);
    if (!verifiedToken) {
      throw new Error("Invalid token");
    }

    if (path.startsWith("/admin") && !verifiedToken.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/upload/:path*",
    "/api/upload/:path*",
  ],
};
