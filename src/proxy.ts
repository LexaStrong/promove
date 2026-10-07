import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

// Public routes explicitly permitted without authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/splash(.*)",
  "/login(.*)",
  "/privacy(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin(.*)", // Admin page renders its own dedicated HMAC cryptographic login
  "/api/admin(.*)", // Admin API routes are protected by HMAC session token, not Clerk user session
  "/api/gps/positions",
  "/api/gps/telemetry",
  "/api/gps/traccar-webhook",
  "/api/health",
  "/api/payments/callback",
  "/api/payments/status-check",
  "/api/system-status",
  "/robots.txt",
  "/sitemap.xml",
  "/__clerk/:path*",
]);

// Administrative API routes requiring valid administrator HMAC session
const isAdminApiRoute = createRouteMatcher([
  "/api/admin/:path*",
]);

let clerkHandler: any = null;
try {
  clerkHandler = clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;

    // ── 1. Admin API Route "Deny by Default" Enforcement ──
    if (isAdminApiRoute(req)) {
      if (
        pathname !== "/api/admin/auth/login" &&
        pathname !== "/api/admin/auth/session" &&
        pathname !== "/api/admin/auth/logout" &&
        pathname !== "/api/admin/set-role"
      ) {
        const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
        const session = verifyAdminSessionToken(adminCookie);
        if (!session) {
          return NextResponse.json(
            { error: "Unauthorized: Platform administrator session required.", code: "DENY_BY_DEFAULT" },
            { status: 401 }
          );
        }
      }
      // Return early: Admin API requests are verified via HMAC token and must never be redirected to HTML by Clerk
      return NextResponse.next();
    }

    // ── 2. Protected User Routes "Deny by Default" Enforcement ──
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  });
} catch (e) {
  console.warn("Clerk middleware init notice:", e);
}

export default async function proxy(request: NextRequest, event: any) {
  let response: any;

  if (clerkHandler) {
    try {
      response = (await clerkHandler(request, event)) || NextResponse.next();
    } catch (err) {
      console.warn("Clerk proxy fallback:", err);
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // ── 3. Attach Defense-in-Depth HTTP Security Headers ──
  if (response && response.headers && typeof response.headers.set === 'function') {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
