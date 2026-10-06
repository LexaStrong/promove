import crypto from 'crypto';

/**
 * ProMove Core Security & Mitigation Utilities
 * Provides defense-in-depth against:
 * 1. Broken Access Control (Deny by default)
 * 2. Injection Flaws (Strict input validation & parameter checking)
 * 3. Identification & Authentication Failures (Constant-time token validation)
 * 4. Server-Side Request Forgery (SSRF protection)
 * 5. Security Logging & Monitoring (Audit trails)
 */

/**
 * 1. INPUT VALIDATION & SANITIZATION
 */

// Validate IMEI: Standard 14-16 digit cellular hardware IMEI
export function isValidImei(imei: string | null | undefined): boolean {
  if (!imei || typeof imei !== 'string') return false;
  const clean = imei.trim();
  return /^[0-9]{14,16}$/.test(clean);
}

// Validate Ghana Vehicle Plate Number (e.g. "GE 3797-20", "GW-9901-24", "AS 4411-23")
export function sanitizePlateNumber(plate: string | null | undefined): string {
  if (!plate || typeof plate !== 'string') return '';
  return plate.trim().toUpperCase().replace(/[^A-Z0-9\s-]/g, '').slice(0, 16);
}

// Sanitize user inputs for text fields (blocks XSS injection vectors)
export function sanitizePlainText(input: string | null | undefined, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .slice(0, maxLength);
}

// Validate safe numeric money values in pesewas (integer only, positive)
export function isValidPesewaAmount(amount: any): boolean {
  return typeof amount === 'number' && Number.isInteger(amount) && amount >= 0 && amount < Number.MAX_SAFE_INTEGER;
}

// Validate Geographic Coordinates
export function isValidLatitude(lat: any): boolean {
  const n = Number(lat);
  return !isNaN(n) && typeof lat !== 'boolean' && n >= -90 && n <= 90;
}

export function isValidLongitude(lng: any): boolean {
  const n = Number(lng);
  return !isNaN(n) && typeof lng !== 'boolean' && n >= -180 && n <= 180;
}

// Validate Telematics Speed
export function isValidSpeedKmh(speed: any): boolean {
  const n = Number(speed);
  return !isNaN(n) && typeof speed !== 'boolean' && n >= 0 && n <= 300;
}

// Validate Email Address
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

// Sanitize Phone Number (Ghana format or international)
export function sanitizePhoneNumber(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.trim().replace(/[^0-9+]/g, '').slice(0, 20);
}

/**
 * 2. SSRF PROTECTION
 * Blocks outbound HTTP requests to private IP ranges, loopback, or cloud metadata endpoints
 */
const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^10\./,                          // Class A private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
  /^192\.168\./,                    // Class C private
  /^169\.254\./,                    // Link-local / Cloud metadata (AWS, GCP, Azure)
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 loopback
  /^fe80:/i,                        // IPv6 link-local
  /^fc00:/i,                        // IPv6 unique local
];

export function isSafeOutboundUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    // Only permit standard HTTP/HTTPS protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost keywords
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '[::1]'
    ) {
      return false;
    }

    // Block integer, hex, or octal IP obfuscation
    if (/^[0-9]+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname) || /\b0[0-9]+/.test(hostname)) {
      return false;
    }

    // Check against private IP regex
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * 3. CONSTANT-TIME COMPARISON
 * Prevents side-channel timing analysis on secrets and passwords by hashing
 * both inputs with SHA-256 to ensure fixed-length byte buffer comparison.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  try {
    const hashA = crypto.createHash('sha256').update(String(a || '')).digest();
    const hashB = crypto.createHash('sha256').update(String(b || '')).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

/**
 * 4. SECURITY AUDIT LOGGING & MONITORING
 * Immutable structured security event recording
 */
export interface SecurityAuditRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
}

const inMemorySecurityLogs: SecurityAuditRecord[] = [];

export function logSecurityAudit(record: Omit<SecurityAuditRecord, 'id' | 'timestamp'>): SecurityAuditRecord {
  const logEntry: SecurityAuditRecord = {
    id: `sec-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
    ...record,
  };

  inMemorySecurityLogs.unshift(logEntry);
  if (inMemorySecurityLogs.length > 500) {
    inMemorySecurityLogs.pop();
  }

  // Also output structured JSON to server stdout for observability / SIEM pipelines
  if (process.env.NODE_ENV !== 'test') {
    console.log(JSON.stringify({
      level: record.severity === 'critical' || record.severity === 'high' ? 'warn' : 'info',
      tag: '[SECURITY_AUDIT]',
      ...logEntry,
    }));
  }

  return logEntry;
}

export function getSecurityAuditLogs(limit = 50): SecurityAuditRecord[] {
  return inMemorySecurityLogs.slice(0, limit);
}
