import { NextResponse, NextRequest } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    role: session.role,
    expiresAt: session.exp,
  });
}
