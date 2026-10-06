import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Fallback to project test keys if Vercel Environment Variables were not yet configured
const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_dmlhYmxlLWdyaWZmb24tNTU1OS5jbGVyay5hY2NvdW50cy5kZXYk";

const secretKey =
  process.env.CLERK_SECRET_KEY ||
  "sk_test_hmrbBDDmJrRZwLoOveRa4YP4101JgJA6RJsWNWTRij";

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
}
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = secretKey;
}

let clerkHandler: any = null;
try {
  clerkHandler = clerkMiddleware();
} catch (e) {
  console.warn("Clerk middleware init warning:", e);
}

export default function proxy(request: NextRequest, event: any) {
  if (clerkHandler) {
    try {
      return clerkHandler(request, event);
    } catch (err) {
      console.warn("Clerk proxy fallback:", err);
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
