import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Pool configuration interface
interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Create a connection pool
const pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE
});

// Main query function
export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Query error', { text, error: errorMessage });
    throw error;
  }
}

// Get a single row
export const queryOne = async (text: string, params?: any[]) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('🔍 queryOne executed', { duration, rows: result.rowCount, hasResult: !!result.rows[0] });
  return result.rows[0];
};

// Get all rows
export async function queryMany<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const res = await query<T>(text, params);
  return res.rows;
}

// Transaction helper
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function close(): Promise<void> {
  await pool.end();
}

// Export pool for direct access if needed
export { pool };