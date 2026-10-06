import { NextResponse } from 'next/server';

/**
 * SECURITY LOCKDOWN:
 * Self-elevation of user roles via this endpoint is permanently disabled.
 * Administrative privileges can only be exercised via the dedicated admin login portal
 * backed by verified server-side credentials and HMAC session tokens.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Forbidden: Self-elevation of administrative privileges is disabled for platform security.',
      code: 'ADMIN_ELEVATION_DISABLED',
    },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405 }
  );
}
