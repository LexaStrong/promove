import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { createClerkClient } from '@clerk/backend';

// Authorized admin emails (comma-separated list from env)
const rawAdminEmails = process.env.ADMIN_EMAIL || 'admin@promovegh.com,admin@promove.com,heisreincarnated@gmail.com';
export const AUTHORIZED_ADMIN_EMAILS = rawAdminEmails
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Session signing secret strictly from environment variables without hardcoded fallbacks
function getSessionSigningSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CLERK_SECRET_KEY;
  if (secret) return secret;
  // Ephemeral in-memory fallback for current process instance
  if (!(globalThis as any).__pm_ephemeral_admin_sec) {
    (globalThis as any).__pm_ephemeral_admin_sec = crypto.randomBytes(32).toString('hex');
  }
  return (globalThis as any).__pm_ephemeral_admin_sec;
}

export const ADMIN_COOKIE_NAME = 'pm_admin_session';

export interface AdminSessionPayload {
  email: string;
  role: 'platform_admin';
  iat: number;
  exp: number;
}

/**
 * Constant-time comparison using SHA-256 digests to eliminate timing and length side-channel leaks
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    const hashA = crypto.createHash('sha256').update(String(a || '')).digest();
    const hashB = crypto.createHash('sha256').update(String(b || '')).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

/**
 * Authenticates admin credentials strictly via Clerk Backend Identity Engine.
 * Verifies that the user exists in Clerk, possesses platform administrator authority,
 * and passes live Clerk password verification.
 * NO static or preconfigured passwords in source code or environment.
 */
export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!emailInput || !passwordInput) {
    return { success: false, error: 'Email and password are required.' };
  }

  const normalizedEmail = emailInput.trim().toLowerCase();
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    console.error('Admin auth notice: CLERK_SECRET_KEY is not configured.');
    return { success: false, error: 'Identity verification engine is not configured.' };
  }

  try {
    const clerk = createClerkClient({ secretKey: clerkSecretKey });
    const userListRes = await clerk.users.getUserList({ emailAddress: [normalizedEmail] });
    const users = userListRes.data || (Array.isArray(userListRes) ? userListRes : []);
    const clerkUser = users[0];

    if (!clerkUser) {
      return { success: false, error: 'Invalid platform administrator credentials.' };
    }

    // Check platform admin permissions
    const userRole = (clerkUser.publicMetadata as any)?.role || (clerkUser.privateMetadata as any)?.role;
    const isAuthorized =
      userRole === 'platform_admin' ||
      userRole === 'admin' ||
      AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail);

    if (!isAuthorized) {
      return {
        success: false,
        error: 'Access denied: This account does not have platform administrator privileges.',
      };
    }

    // Verify password directly against Clerk
    const verifyRes = await clerk.users.verifyPassword({
      userId: clerkUser.id,
      password: passwordInput,
    });

    if ((verifyRes as any)?.verified === false) {
      return { success: false, error: 'Invalid platform administrator credentials.' };
    }

    return { success: true, email: normalizedEmail };
  } catch (err: any) {
    if (err?.status === 422 || err?.errors?.[0]?.code === 'incorrect_password') {
      return { success: false, error: 'Invalid platform administrator credentials.' };
    }
    console.error('Clerk password verification exception:', err?.message || err);
    return { success: false, error: 'Invalid platform administrator credentials.' };
  }
}

/**
 * Create a cryptographically signed HMAC token for the administrator session
 */
export function signAdminSessionToken(email: string): string {
  const secret = getSessionSigningSecret();
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    role: 'platform_admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 12 * 3600, // 12-hour session
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode an HMAC admin session token
 */
export function verifyAdminSessionToken(token: string | null | undefined): AdminSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const secret = getSessionSigningSecret();

  // Verify HMAC signature in constant time
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  if (!secureCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: AdminSessionPayload = JSON.parse(jsonStr);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    if (!payload.email || payload.role !== 'platform_admin') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify admin session from Request / NextRequest
 */
export function getAdminSessionFromRequest(request: Request | NextRequest): AdminSessionPayload | null {
  try {
    // Check cookie
    let cookieHeader: string | null = null;
    if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
      const c = (request as any).cookies.get(ADMIN_COOKIE_NAME);
      if (c?.value) {
        return verifyAdminSessionToken(c.value);
      }
    }

    cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const match = cookieHeader
      .split(';')
      .map(s => s.trim())
      .find(s => s.startsWith(`${ADMIN_COOKIE_NAME}=`));

    if (!match) return null;

    const token = decodeURIComponent(match.substring(ADMIN_COOKIE_NAME.length + 1));
    return verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}
