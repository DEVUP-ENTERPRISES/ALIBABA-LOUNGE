import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin/api";

// Secret slug that maps to the admin panel (set in .env.local)
const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "admin";
const ADMIN_BASE = `/${ADMIN_SLUG}/admin`;

const CUSTOMER_AUTH_ROUTES = ["/login", "/signup"];
const CUSTOMER_PROTECTED   = ["/account", "/reservations/my"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── Block direct /admin/* access — only the slug URL is public ── */
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Someone typed /admin directly in the browser — send them home
    return NextResponse.redirect(new URL("/", request.url));
  }

  /* ── Admin slug routes ── */
  if (pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`)) {
    const hasAdminToken = Boolean(request.cookies.get(ADMIN_TOKEN_COOKIE)?.value);
    const isLoginRoute  = pathname === `${ADMIN_BASE}/login`;

    if (isLoginRoute && hasAdminToken) {
      // Already logged in → skip login page
      return NextResponse.redirect(new URL(`${ADMIN_BASE}/dashboard`, request.url));
    }
    if (!isLoginRoute && !hasAdminToken) {
      // Not authenticated → send to slug login
      const loginUrl = new URL(`${ADMIN_BASE}/login`, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  /* ── Customer auth ── */
  const session = request.cookies.get("__session")?.value;

  if (CUSTOMER_AUTH_ROUTES.some((r) => pathname.startsWith(r)) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (CUSTOMER_PROTECTED.some((r) => pathname.startsWith(r)) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)"],
};
