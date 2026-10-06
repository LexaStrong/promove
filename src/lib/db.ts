import { neon } from '@neondatabase/serverless';

// Neon Lakebase Postgres connection string - strictly read from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

/**
 * Execute a parameterized SQL query on Neon Lakebase Postgres
 */
export async function query<T = any>(queryString: string, params: any[] = []): Promise<T[]> {
  if (!sql) {
    return [];
  }
  const result = await (sql as any).query(queryString, params);
  return result as T[];
}

/**
 * Test database connectivity to Neon Lakebase Postgres
 */
export async function checkDatabaseConnection(): Promise<{ ok: boolean; timestamp?: string; tables?: number; error?: string }> {
  if (!sql) {
    return { ok: false, error: 'DATABASE_URL is not configured' };
  }
  try {
    const rows = await (sql as any).query(
      "SELECT NOW() as current_time, count(*)::int as table_count FROM information_schema.tables WHERE table_schema = 'public'"
    );
    return {
      ok: true,
      timestamp: rows[0]?.current_time,
      tables: rows[0]?.table_count,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Database connection error' };
  }
}
