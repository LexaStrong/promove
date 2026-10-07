import { NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  signAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from '@/lib/admin-auth';
import { logSecurityAudit } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const emailStr = String(email).trim().toLowerCase();
    const authResult = await verifyAdminCredentials(emailStr, String(password));
    if (!authResult.success) {
      logSecurityAudit({
        action: 'ADMIN_LOGIN_FAILED',
        actor: emailStr,
        severity: 'high',
        details: { message: authResult.error || 'Failed administrative credentials challenge' },
      });

      return NextResponse.json(
        { error: authResult.error || 'Invalid platform administrator credentials.' },
        { status: 401 }
      );
    }

    logSecurityAudit({
      action: 'ADMIN_LOGIN_SUCCESS',
      actor: emailStr,
      severity: 'medium',
      details: { role: 'platform_admin' },
    });

    // Sign HMAC token
    const token = signAdminSessionToken(emailStr);

    // Construct response and set secure HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      email: String(email).trim().toLowerCase(),
      role: 'platform_admin',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 12 * 3600, // 12 hours
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed due to an internal server error.' },
      { status: 500 }
    );
  }
}
