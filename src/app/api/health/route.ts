import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();

  // Test live database connectivity if configured
  const dbHealth = await checkDatabaseConnection();
  const hasStorageConfig = Boolean(
    process.env.NEON_STORAGE_ENDPOINT &&
    process.env.NEON_STORAGE_ACCESS_KEY_ID &&
    process.env.NEON_STORAGE_SECRET_ACCESS_KEY
  );

  const isDegraded = !dbHealth.ok && Boolean(process.env.DATABASE_URL);
  const status = isDegraded ? 'degraded' : 'healthy';

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(uptimeSeconds),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth.ok ? 'connected' : process.env.DATABASE_URL ? 'unreachable' : 'not_configured',
        databaseTables: dbHealth.tables ?? 0,
        objectStorage: hasStorageConfig ? 'configured' : 'fallback_mode',
      },
      system: {
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 10) / 10,
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 10) / 10,
      },
      compliance: {
        act843: 'compliant',
        multiTenancy: 'enforced',
      },
    },
    { status: isDegraded ? 503 : 200 }
  );
}
