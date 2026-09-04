// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/src/shared/lib/db';

async function normalizeRoleAndPermissionData() {
  const userRoleUpdate = await pool.query(`
    UPDATE user_boards
    SET role = lower(trim(role))
    WHERE role IS NOT NULL
      AND lower(trim(role)) <> role;
  `);

  const sharePermissionUpdate = await pool.query(`
    UPDATE board_shares
    SET permission_level = upper(trim(permission_level))
    WHERE permission_level IS NOT NULL
      AND upper(trim(permission_level)) <> permission_level;
  `);

  console.log(`✅ Normalized ${userRoleUpdate.rowCount ?? 0} user_boards role values.`);
  console.log(
    `✅ Normalized ${sharePermissionUpdate.rowCount ?? 0} board_shares permission values.`
  );
}

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

    await normalizeRoleAndPermissionData();
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

fixUserRoleEnum();
