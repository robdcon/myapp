// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/lib/db';

async function assignBoardToGoogleUser() {
  try {
    console.log('🔍 Finding Google OAuth user...\n');

    // Find Google OAuth user
    const googleUserResult = await pool.query(`
      SELECT id, auth0_id, email 
      FROM users 
      WHERE auth0_id LIKE 'google-oauth2|%'
      ORDER BY id LIMIT 1
    `);

    if (googleUserResult.rows.length === 0) {
      console.log('⚠️  No Google OAuth user found. Using first available user.');
      const anyUserResult = await pool.query(
        'SELECT id, auth0_id FROM users ORDER BY id LIMIT 1'
      );
      if (anyUserResult.rows.length === 0) {
        console.log('❌ No users found in database!');
        process.exit(1);
      }
      const user = anyUserResult.rows[0];
      console.log(`Using user: ${user.auth0_id}\n`);
      await assignBoard(user.id, user.auth0_id);
      return;
    }

    const googleUser = googleUserResult.rows[0];
    console.log(`✅ Found Google OAuth user:`);
    console.log(`   ID: ${googleUser.id}`);
    console.log(`   Auth0 ID: ${googleUser.auth0_id}`);
    console.log(`   Email: ${googleUser.email || 'N/A'}\n`);

    await assignBoard(googleUser.id, googleUser.auth0_id);
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

async function assignBoard(userId: number, auth0Id: string) {
  // Get Events board
  const boardResult = await pool.query(`
    SELECT id, name FROM boards WHERE board_type = 'EVENTS' LIMIT 1
  `);

  if (boardResult.rows.length === 0) {
    console.log('❌ No Events board found!');
    await pool.end();
    process.exit(1);
  }

  const board = boardResult.rows[0];
  console.log(`📋 Events board: ${board.name} (ID: ${board.id})\n`);

  // Assign ownership
  console.log(`📝 Assigning board to user...`);
  await pool.query(
    `
    INSERT INTO user_boards (user_id, board_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, board_id) DO UPDATE SET role = $3
  `,
    [userId, board.id, 'owner']
  );

  console.log(`✅ Board assigned to user: ${auth0Id}\n`);
  console.log(`🔗 OAuth connection URL:`);
  console.log(`   http://localhost:3000/api/auth/google/connect?boardId=${board.id}\n`);

  await pool.end();
}

assignBoardToGoogleUser();
