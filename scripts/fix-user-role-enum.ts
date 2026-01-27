// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/lib/db';

async function fixUserRoleEnum() {
  try {
    console.log('🔍 Checking user_role enum values...\n');

    const result = await pool.query(`
      SELECT unnest(enum_range(NULL::user_role)) as role_value;
    `);

    console.log('Current user_role enum values:');
    result.rows.forEach((row) => {
      console.log(`  - ${row.role_value}`);
    });

    const requiredValues = ['owner', 'editor', 'viewer'];
    const existingValues = result.rows.map((row) => row.role_value);

    for (const value of requiredValues) {
      if (!existingValues.includes(value)) {
        console.log(`\n❌ ${value} enum value is missing!`);
        console.log(`Adding ${value} to user_role enum...\n`);

        await pool.query(`
          ALTER TYPE user_role ADD VALUE IF NOT EXISTS '${value}';
        `);

        console.log(`✅ ${value} enum value added!`);
      } else {
        console.log(`\n✅ ${value} enum value exists!`);
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

fixUserRoleEnum();
