import { pool } from '@/src/shared/lib/db';

/**
 * Check if user has edit permission on a board
 * Checks both user_boards (ownership) and board_shares (shared access)
 */
export async function checkBoardEditPermission(
  boardId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1
       FROM user_boards ub
       WHERE ub.board_id = $1
         AND ub.user_id = (SELECT id FROM users WHERE auth0_id = $2)
     )
     OR EXISTS (
       SELECT 1
       FROM board_shares bs
       WHERE bs.board_id = $1
         AND bs.shared_with_user_id = $2
         AND bs.permission_level IN ('EDIT', 'ADMIN')
     ) AS has_permission`,
    [boardId, userId]
  );

  return Boolean(result.rows[0]?.has_permission);
}

/**
 * Check if user has view permission on a board
 *
 * Note on shared_with_user_id type: the board_shares table stores Auth0 IDs
 * directly as TEXT (see migration 001_add_board_sharing.sql), so $2 (context.user.sub)
 * is the correct value to compare — no integer-ID conversion is needed here,
 * unlike the user_boards branch which joins via the users table.
 */
export async function checkBoardViewPermission(
  boardId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1
       FROM user_boards ub
       WHERE ub.board_id = $1
         AND ub.user_id = (SELECT id FROM users WHERE auth0_id = $2)
     )
     OR EXISTS (
       SELECT 1
       FROM board_shares bs
       WHERE bs.board_id = $1
         AND bs.shared_with_user_id = $2
     ) AS has_permission`,
    [boardId, userId]
  );

  return Boolean(result.rows[0]?.has_permission);
}
