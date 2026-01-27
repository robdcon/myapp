import { pool } from '@/lib/db';

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
