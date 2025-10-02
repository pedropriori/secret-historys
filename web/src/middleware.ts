import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return;

  // Allow access to login page without authentication
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get("admin_auth")?.value;
  if (!cookie) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };


