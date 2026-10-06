import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkDatabaseConnection } from '@/lib/db';
import { storageProvider } from '@/lib/storage';

export async function GET() {
  let userId: string | null = null;
  try {
    const clerkAuth = await auth();
    userId = clerkAuth.userId || null;
  } catch {
    // Graceful fallback if Clerk credentials not yet provisioned
  }
  const dbStatus = await checkDatabaseConnection();

  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      authentication: {
        provider: 'Clerk',
        userId,
        isAuthenticated: !!userId,
      },
      database: {
        provider: 'Neon Lakebase Postgres',
        connected: dbStatus.ok,
        tablesCount: dbStatus.tables ?? null,
        error: dbStatus.error ?? null,
      },
      storage: {
        provider: 'Neon Object Storage (S3-compatible)',
        buckets: ['documents', 'images'],
        endpoint: process.env.NEON_STORAGE_ENDPOINT || 'https://br-old-moon-b4kw1lhy.storage.c-6.us-east-2.aws.neon.tech',
        ready: true,
      },
    },
  });
}
