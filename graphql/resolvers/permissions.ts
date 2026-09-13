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
         AND LOWER(ub.role) IN ('owner', 'editor')
     )
     OR EXISTS (
       SELECT 1
       FROM board_shares bs
       WHERE bs.board_id = $1
         AND bs.shared_with_user_id = $2
         AND LOWER(bs.permission_level) IN ('edit', 'admin')
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
         AND LOWER(bs.permission_level) IN ('view', 'edit', 'admin')
     ) AS has_permission`,
    [boardId, userId]
  );

  return Boolean(result.rows[0]?.has_permission);
}

/**
 * Check if user is the OWNER of a board via user_boards.
 * Used for destructive actions (e.g. deleting a board) that should not
 * be available to editors or shared ADMIN-permission users.
 */
export async function checkBoardOwnerPermission(
  boardId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1
       FROM user_boards ub
       WHERE ub.board_id = $1
         AND ub.user_id = (SELECT id FROM users WHERE auth0_id = $2)
         AND LOWER(ub.role) = 'owner'
     ) AS has_permission`,
    [boardId, userId]
  );

  return Boolean(result.rows[0]?.has_permission);
}

/**
 * Get a member's board role normalized to lowercase.
 */
export async function getBoardRoleForUser(
  boardId: string,
  userId: string
): Promise<string | null> {
  const result = await pool.query(
    `SELECT LOWER(ub.role) AS role
     FROM user_boards ub
     WHERE ub.board_id = $1
       AND ub.user_id = (SELECT id FROM users WHERE auth0_id = $2)`,
    [boardId, userId]
  );

  const role = result.rows[0]?.role;
  return typeof role === 'string' ? role.toLowerCase() : null;
}
