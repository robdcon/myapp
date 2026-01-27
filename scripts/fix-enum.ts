// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/lib/db';

async function checkEnumValues() {
  try {
    console.log('Checking board_type enum values...\n');

    const result = await pool.query(`
      SELECT unnest(enum_range(NULL::board_type)) as board_type;
    `);

    console.log('Current enum values:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.board_type}`);
    });

    if (!result.rows.some((row) => row.board_type === 'EVENTS')) {
      console.log('\n❌ EVENTS enum value is missing!');
      console.log('Adding EVENTS to board_type enum...\n');

      await pool.query(`
        ALTER TYPE board_type ADD VALUE IF NOT EXISTS 'EVENTS';
      `);

      console.log('✅ EVENTS enum value added!');
    } else {
      console.log('\n✅ EVENTS enum value exists!');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEnumValues();
