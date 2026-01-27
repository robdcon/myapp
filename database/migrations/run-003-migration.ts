import 'dotenv/config';
import { pool } from '../../lib/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const sqlFile = path.join(__dirname, '003_add_google_calendar.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  console.log('🚀 Running Google Calendar migration...\n');

  try {
    await pool.query(sql);
    console.log('✅ Migration completed successfully!\n');

    // Verify boards columns
    const boardsResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'boards' 
        AND (column_name LIKE '%calendar%' OR column_name LIKE '%google%')
      ORDER BY ordinal_position
    `);

    console.log('📋 Boards table - New columns:');
    boardsResult.rows.forEach((row) => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Verify items columns
    const itemsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'items' 
        AND (column_name LIKE '%event%' OR column_name LIKE '%google%')
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Items table - New columns:');
    itemsResult.rows.forEach((row) => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n✅ Database is ready for Google Calendar integration!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
