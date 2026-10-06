import crypto from 'crypto';
import type { NextRequest } from 'next/server';

// Authorized admin emails (comma-separated list from env, with secure enterprise fallbacks)
const rawAdminEmails = process.env.ADMIN_EMAIL || 'admin@promovegh.com,admin@promove.com,heisreincarnated@gmail.com';
export const AUTHORIZED_ADMIN_EMAILS = rawAdminEmails
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Master Admin Password configured strictly on server
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ProMove@Admin2026!';

// Secret for HMAC session token signing
export const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'promove_enterprise_admin_sec_2026_x89a';

export const ADMIN_COOKIE_NAME = 'pm_admin_session';

export interface AdminSessionPayload {
  email: string;
  role: 'platform_admin';
  iat: number;
  exp: number;
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      // Compare against self to consume constant time
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Verify administrator email and password against server configuration
 */
export function verifyAdminCredentials(emailInput: string, passwordInput: string): boolean {
  if (!emailInput || !passwordInput) return false;
  const normalizedEmail = emailInput.trim().toLowerCase();

  const isEmailAuthorized = AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail);
  const isPasswordCorrect = secureCompare(passwordInput.trim(), ADMIN_PASSWORD.trim());

  return isEmailAuthorized && isPasswordCorrect;
}

/**
 * Create a cryptographically signed HMAC token for the administrator session
 */
export function signAdminSessionToken(email: string): string {
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    role: 'platform_admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 12 * 3600, // 12-hour session
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
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

  // Verify HMAC signature in constant time
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
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
