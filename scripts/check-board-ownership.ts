// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { pool } from '@/lib/db';

async function checkBoardOwnership() {
  try {
    console.log('🔍 Checking Events board ownership...\n');

    const result = await pool.query(`
      SELECT 
        b.id, 
        b.name, 
        b.board_type,
        ub.user_id,
        ub.role,
        u.auth0_id
      FROM boards b
      LEFT JOIN user_boards ub ON b.id = ub.board_id
      LEFT JOIN users u ON ub.user_id = u.id
      WHERE b.board_type = 'EVENTS'
    `);

    if (result.rows.length === 0) {
      console.log('❌ No Events boards found');
      return;
    }

    console.log('Events boards:');
    result.rows.forEach((row) => {
      console.log(`\nBoard ID: ${row.id}`);
      console.log(`Name: ${row.name}`);
      console.log(`Type: ${row.board_type}`);
      console.log(`User ID: ${row.user_id || 'NO OWNER!'}`);
      console.log(`Role: ${row.role || 'NO ROLE!'}`);
      console.log(`Auth0 ID: ${row.auth0_id || 'NO AUTH0_ID!'}`);
    });

    // Check if board has no owner
    const boardsWithoutOwner = result.rows.filter((row) => !row.user_id);
    if (boardsWithoutOwner.length > 0) {
      console.log('\n⚠️  Found boards without owners!');
      console.log('We need to assign ownership to test the OAuth flow.');

      // Get first user
      const userResult = await pool.query(
        'SELECT id, auth0_id FROM users ORDER BY id LIMIT 1'
      );
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log(`\n📝 Assigning boards to user: ${user.auth0_id}`);

        for (const board of boardsWithoutOwner) {
          await pool.query(
            `
            INSERT INTO user_boards (user_id, board_id, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, board_id) DO UPDATE SET role = $3
          `,
            [user.id, board.id, 'owner']
          );
          console.log(`✅ Assigned board ${board.id} (${board.name}) to user`);
        }
      }
    } else {
      console.log('\n✅ All Events boards have owners');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBoardOwnership();
