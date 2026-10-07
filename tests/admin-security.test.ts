import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Unit-test test fixtures (no hardcoded production secrets)
const TEST_SIGNING_SECRET = 'unit_test_ephemeral_signing_secret_32bytes_sample';
const AUTHORIZED_ADMIN_EMAILS = [
  'admin@promovegh.com',
  'admin@promove.com',
  'heisreincarnated@gmail.com',
];

function secureCompare(a: string, b: string): boolean {
  try {
    const hashA = crypto.createHash('sha256').update(String(a || '')).digest();
    const hashB = crypto.createHash('sha256').update(String(b || '')).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

// Simulated Clerk-backed admin identity validation logic
interface MockClerkUser {
  id: string;
  email: string;
  role: string;
  passwordHash: string;
}

const mockClerkDirectory: MockClerkUser[] = [
  {
    id: 'user_admin_001',
    email: 'admin@promovegh.com',
    role: 'platform_admin',
    passwordHash: crypto.createHash('sha256').update('ClerkAdminPasswordTest123!').digest('hex'),
  },
  {
    id: 'user_regular_002',
    email: 'driver@test.gh',
    role: 'driver',
    passwordHash: crypto.createHash('sha256').update('DriverPasswordTest123!').digest('hex'),
  },
];

function simulateClerkAdminAuth(emailInput: string, passwordInput: string): { success: boolean; error?: string } {
  if (!emailInput || !passwordInput) {
    return { success: false, error: 'Email and password are required.' };
  }

  const normalized = emailInput.trim().toLowerCase();
  const user = mockClerkDirectory.find(u => u.email === normalized);
  if (!user) {
    return { success: false, error: 'Invalid platform administrator credentials.' };
  }

  const isAuthorized = user.role === 'platform_admin' || AUTHORIZED_ADMIN_EMAILS.includes(normalized);
  if (!isAuthorized) {
    return { success: false, error: 'Access denied: Insufficient administrator privileges.' };
  }

  const inputHash = crypto.createHash('sha256').update(passwordInput).digest('hex');
  if (!secureCompare(inputHash, user.passwordHash)) {
    return { success: false, error: 'Invalid platform administrator credentials.' };
  }

  return { success: true };
}

function signAdminSessionToken(email: string): string {
  const payload = {
    email: email.trim().toLowerCase(),
    role: 'platform_admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TEST_SIGNING_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

function verifyAdminSessionToken(token: string | null | undefined): any | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', TEST_SIGNING_SECRET)
    .update(payloadB64)
    .digest('base64url');
  if (!secureCompare(signature, expectedSignature)) return null;

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.email || payload.role !== 'platform_admin') return null;
    return payload;
  } catch {
    return null;
  }
}

test('Admin Security: Validates authorized Clerk admin credentials correctly', () => {
  const result = simulateClerkAdminAuth('admin@promovegh.com', 'ClerkAdminPasswordTest123!');
  assert.strictEqual(result.success, true, 'Valid Clerk admin credentials must authenticate successfully');
});

test('Admin Security: Deny-by-default rejects invalid credentials, non-admins, or attackers', () => {
  assert.strictEqual(simulateClerkAdminAuth('admin@promovegh.com', 'WrongPassword123').success, false);
  assert.strictEqual(simulateClerkAdminAuth('attacker@malicious.com', 'ClerkAdminPasswordTest123!').success, false);
  assert.strictEqual(simulateClerkAdminAuth('', '').success, false);
  assert.strictEqual(simulateClerkAdminAuth('driver@test.gh', 'DriverPasswordTest123!').success, false);
});

test('Admin Security: Signs and verifies tamper-evident HMAC admin session tokens', () => {
  const email = 'admin@promovegh.com';
  const token = signAdminSessionToken(email);

  assert.ok(token.includes('.'), 'Token must contain payload and HMAC signature');
  const session = verifyAdminSessionToken(token);
  assert.ok(session);
  assert.strictEqual(session.email, email);
  assert.strictEqual(session.role, 'platform_admin');

  // Tampered token test
  const tampered = token.slice(0, -4) + 'abcd';
  assert.strictEqual(verifyAdminSessionToken(tampered), null);
});

test('Admin Security: Timing-safe comparison prevents side-channel password timing leaks', () => {
  assert.strictEqual(secureCompare('secret_token_123', 'secret_token_123'), true);
  assert.strictEqual(secureCompare('secret_token_123', 'wrong_token_456'), false);
  assert.strictEqual(secureCompare('secret', 'secret_longer'), false);
});

// Input Sanitization Tests
function sanitizePlainText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/[<>'"&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' }[c] || c));
}

function isValidImei(imei: string | null | undefined): boolean {
  return !!imei && /^[0-9]{14,16}$/.test(imei.trim());
}

test('Security Strategy: Input sanitization strips XSS injection payload', () => {
  const dirty = '<script>alert("XSS")</script>';
  const clean = sanitizePlainText(dirty);
  assert.strictEqual(clean.includes('<script>'), false);
  assert.ok(clean.includes('&lt;script&gt;'));
});

test('Security Strategy: Validates hardware GPS IMEI format', () => {
  assert.strictEqual(isValidImei('864201049281700'), true);
  assert.strictEqual(isValidImei('12345'), false); // Too short
  assert.strictEqual(isValidImei('864201049281700; DROP TABLE vehicles;'), false); // SQL injection attempt
});

// SSRF Protection Tests
function isSafeOutboundUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname === '[::1]') return false;
    if (/^[0-9]+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname) || /\b0[0-9]+/.test(hostname)) return false;
    if (/^127\./.test(hostname)) return false;
    if (/^169\.254\./.test(hostname)) return false;
    if (/^10\./.test(hostname)) return false;
    if (/^192\.168\./.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

test('Security Strategy: SSRF guard blocks loopback, private ranges, cloud metadata, and encoded IPs', () => {
  assert.strictEqual(isSafeOutboundUrl('http://127.0.0.1:8080/admin'), false);
  assert.strictEqual(isSafeOutboundUrl('http://localhost:3000'), false);
  assert.strictEqual(isSafeOutboundUrl('http://169.254.169.254/latest/meta-data/'), false); // AWS/cloud metadata
  assert.strictEqual(isSafeOutboundUrl('http://192.168.1.1/router'), false);
  assert.strictEqual(isSafeOutboundUrl('http://2130706433/'), false); // Integer IP encoding for 127.0.0.1
  assert.strictEqual(isSafeOutboundUrl('http://0x7f000001/'), false); // Hex IP encoding
  assert.strictEqual(isSafeOutboundUrl('https://api.promovegh.com/webhook'), true);
});
