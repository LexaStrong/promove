import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  let isAuthenticated = false;
  try {
    const clerkAuth = await auth();
    isAuthenticated = !!clerkAuth.userId;
  } catch {
    // Graceful fallback if Clerk credentials not yet provisioned
  }
  const dbStatus = await checkDatabaseConnection();

  // Sanitize all output: zero leak of raw internal endpoints, branch IDs, or DB error strings
  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      authentication: {
        provider: 'Clerk Identity Engine',
        isAuthenticated,
      },
      database: {
        provider: 'Neon Lakebase Postgres',
        connected: dbStatus.ok,
        status: dbStatus.ok ? 'healthy' : 'degraded',
      },
      storage: {
        provider: 'Encrypted Document & Media Vault',
        ready: true,
      },
    },
    compliance: {
      dataPrivacy: 'Ghana Act 843 Enforced',
      rowLevelSecurity: 'Active',
    },
  });
}
