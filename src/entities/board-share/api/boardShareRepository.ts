import { pool } from '@/src/shared/lib/db';
import { GraphQLError } from 'graphql';
import { randomBytes } from 'crypto';

export async function checkUserHasAdminAccess(boardId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 
       CASE 
         WHEN ub.role = 'OWNER' THEN true
         WHEN bs.permission_level = 'ADMIN' THEN true
         ELSE false
       END as has_admin_access
     FROM (SELECT $1::integer as board_id) b
     LEFT JOIN user_boards ub ON ub.board_id = b.board_id
     LEFT JOIN users u ON u.id = ub.user_id AND u.auth0_id = $2
     LEFT JOIN board_shares bs ON bs.board_id = b.board_id 
       AND bs.shared_with_user_id = $2 
       AND bs.permission_level = 'ADMIN'
     LIMIT 1`,
    [boardId, userId]
  );
  return result.rows[0]?.has_admin_access === true;
}

export async function getBoardShares(boardId: string) {
  const result = await pool.query(
    `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
     FROM board_shares bs
     LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
     WHERE bs.board_id = $1
     ORDER BY bs.created_at DESC`,
    [boardId]
  );
  return result.rows;
}

export async function getSharedBoards(userId: string) {
  const result = await pool.query(
    `SELECT b.*, bs.permission_level as my_permission
     FROM boards b
     INNER JOIN board_shares bs ON bs.board_id = b.id
     WHERE bs.shared_with_user_id = $1
     ORDER BY bs.created_at DESC`,
    [userId]
  );
  return result.rows.map(({ my_permission, ...rest }) => ({
    ...rest,
    myPermission: my_permission,
  }));
}

export async function createBoardShare(
  boardId: string,
  email: string,
  permission: 'VIEW' | 'EDIT' | 'ADMIN',
  sharedByUserId: string
) {
  const userResult = await pool.query('SELECT auth0_id FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    throw new GraphQLError('User not found with that email', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  const sharedWithUserId = userResult.rows[0].auth0_id;
  if (sharedWithUserId === sharedByUserId) {
    throw new GraphQLError('You cannot share a board with yourself', {
      extensions: { code: 'BAD_REQUEST' },
    });
  }

  const existingShare = await pool.query(
    'SELECT id FROM board_shares WHERE board_id = $1 AND shared_with_user_id = $2',
    [boardId, sharedWithUserId]
  );

  if (existingShare.rows.length > 0) {
    throw new GraphQLError('Board is already shared with this user', {
      extensions: { code: 'BAD_REQUEST' },
    });
  }

  const result = await pool.query(
    `INSERT INTO board_shares (board_id, shared_with_user_id, shared_by_user_id, permission_level)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [boardId, sharedWithUserId, sharedByUserId, permission]
  );

  const shareWithDetails = await pool.query(
    `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
     FROM board_shares bs
     LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
     WHERE bs.id = $1`,
    [result.rows[0].id]
  );

  return shareWithDetails.rows[0];
}

export async function updateBoardSharePermission(
  shareId: string,
  permission: 'VIEW' | 'EDIT' | 'ADMIN',
  userId: string
) {
  const shareResult = await pool.query(
    `SELECT bs.*, ub.role,
       CASE 
         WHEN ub.role IS NOT NULL THEN ub.role
         WHEN admin_share.permission_level = 'ADMIN' THEN 'ADMIN'
         ELSE NULL
       END as user_permission
     FROM board_shares bs
     LEFT JOIN user_boards ub ON ub.board_id = bs.board_id
     LEFT JOIN users u ON u.id = ub.user_id AND u.auth0_id = $2
     LEFT JOIN board_shares admin_share ON admin_share.board_id = bs.board_id 
       AND admin_share.shared_with_user_id = $2 
       AND admin_share.permission_level = 'ADMIN'
     WHERE bs.id = $1`,
    [shareId, userId]
  );

  if (shareResult.rows.length === 0) {
    throw new GraphQLError('Share not found', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  const hasPermission =
    shareResult.rows[0].user_permission === 'OWNER' ||
    shareResult.rows[0].user_permission === 'ADMIN';

  if (!hasPermission) {
    throw new GraphQLError('You do not have permission to modify this share', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  await pool.query(
    `UPDATE board_shares 
     SET permission_level = $1, updated_at = NOW()
     WHERE id = $2`,
    [permission, shareId]
  );

  const updatedShare = await pool.query(
    `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
     FROM board_shares bs
     LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
     WHERE bs.id = $1`,
    [shareId]
  );

  return updatedShare.rows[0];
}

export async function deleteBoardShare(shareId: string, userId: string) {
  const shareResult = await pool.query(
    `SELECT bs.*,
       CASE 
         WHEN ub.role IS NOT NULL THEN ub.role
         WHEN admin_share.permission_level = 'ADMIN' THEN 'ADMIN'
         ELSE NULL
       END as user_permission
     FROM board_shares bs
     LEFT JOIN user_boards ub ON ub.board_id = bs.board_id
     LEFT JOIN users u ON u.id = ub.user_id AND u.auth0_id = $2
     LEFT JOIN board_shares admin_share ON admin_share.board_id = bs.board_id 
       AND admin_share.shared_with_user_id = $2 
       AND admin_share.permission_level = 'ADMIN'
     WHERE bs.id = $1`,
    [shareId, userId]
  );

  if (shareResult.rows.length === 0) {
    throw new GraphQLError('Share not found', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  const hasPermission =
    shareResult.rows[0].user_permission === 'OWNER' ||
    shareResult.rows[0].user_permission === 'ADMIN';

  if (!hasPermission) {
    throw new GraphQLError('You do not have permission to remove this share', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  await pool.query('DELETE FROM board_shares WHERE id = $1', [shareId]);
  return true;
}

export async function createShareLink(boardId: string, userId: string) {
  const ownerCheck = await pool.query(
    `SELECT ub.role 
     FROM user_boards ub
     INNER JOIN users u ON u.id = ub.user_id AND u.auth0_id = $2
     WHERE ub.board_id = $1`,
    [boardId, userId]
  );

  if (ownerCheck.rows.length === 0 || ownerCheck.rows[0]?.role !== 'OWNER') {
    throw new GraphQLError('Only the board owner can generate share links', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  const token = randomBytes(32).toString('hex');
  await pool.query(
    `UPDATE boards 
     SET share_token = $1, is_public = true 
     WHERE id = $2`,
    [token, boardId]
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/boards/shared/${token}`;
}

export async function deleteShareLink(boardId: string, userId: string) {
  const ownerCheck = await pool.query(
    `SELECT ub.role 
     FROM user_boards ub
     INNER JOIN users u ON u.id = ub.user_id AND u.auth0_id = $2
     WHERE ub.board_id = $1`,
    [boardId, userId]
  );

  if (ownerCheck.rows.length === 0 || ownerCheck.rows[0]?.role !== 'OWNER') {
    throw new GraphQLError('Only the board owner can revoke share links', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  await pool.query(
    `UPDATE boards 
     SET share_token = NULL, is_public = false 
     WHERE id = $1`,
    [boardId]
  );

  return true;
}
