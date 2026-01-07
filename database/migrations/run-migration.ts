import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file before importing pool
config();

import { pool } from '@/lib/db';

async function runMigration() {
  // Debug: Check if environment variables are loaded
  console.log('Environment check:');
  console.log('PGUSER:', process.env.PGUSER);
  console.log('PGPASSWORD exists:', !!process.env.PGPASSWORD);
  console.log('PGPASSWORD type:', typeof process.env.PGPASSWORD);
  console.log('PGHOST:', process.env.PGHOST);
  console.log('PGDATABASE:', process.env.PGDATABASE);
  console.log('---');
  
  const migrationPath = path.join(process.cwd(), 'database', 'migrations', '001_add_board_sharing.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    console.log('Running migration: 001_add_board_sharing.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'board_shares'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ board_shares table created');
    }
    
    // Verify columns were added to boards table
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'boards' 
      AND column_name IN ('is_public', 'share_token')
    `);
    
    console.log(`✅ Added ${columnsResult.rows.length} columns to boards table`);
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
