import { pool } from '@/lib/db';
import { GraphQLError } from 'graphql';
import { randomBytes } from 'crypto';

interface ShareBoardArgs {
  boardId: string;
  email: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
}

interface UpdateBoardShareArgs {
  shareId: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
}

interface RemoveBoardShareArgs {
  shareId: string;
}

interface GenerateShareLinkArgs {
  boardId: string;
}

interface RevokeShareLinkArgs {
  boardId: string;
}

export const boardShareResolvers = {
  Query: {
    // Get all shares for a specific board
    boardShares: async (_: unknown, { boardId }: { boardId: string }, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if user has admin access to view shares
      const permissionCheck = await pool.query(
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

      const hasAdminAccess = permissionCheck.rows[0]?.has_admin_access === true;

      if (!hasAdminAccess) {
        throw new GraphQLError(
          'You do not have permission to view shares for this board',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      const result = await pool.query(
        `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
         FROM board_shares bs
         LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
         WHERE bs.board_id = $1
         ORDER BY bs.created_at DESC`,
        [boardId]
      );

      return result.rows;
    },

    // Get boards shared with the current user
    sharedBoards: async (_: unknown, __: unknown, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      console.log('🔍 sharedBoards query - userId:', userId);

      const result = await pool.query(
        `SELECT b.*, bs.permission_level as my_permission
         FROM boards b
         INNER JOIN board_shares bs ON bs.board_id = b.id
         WHERE bs.shared_with_user_id = $1
         ORDER BY bs.created_at DESC`,
        [userId]
      );

      // Map database field to GraphQL schema (snake_case -> camelCase)
      return result.rows.map(({ my_permission, ...rest }) => ({
        ...rest,
        myPermission: my_permission,
      }));
    },
  },

  Mutation: {
    // Share a board with another user by email
    shareBoard: async (_: unknown, args: ShareBoardArgs, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { boardId, email, permission } = args;

      // Check if user has permission to share (must be owner or ADMIN)
      const permissionCheck = await pool.query(
        `SELECT 
           CASE 
             WHEN ub.role = 'OWNER' THEN true
             WHEN bs.permission_level = 'ADMIN' THEN true
             ELSE false
           END as can_share
         FROM (SELECT $1::integer as board_id) b
         LEFT JOIN user_boards ub ON ub.board_id = b.board_id
         LEFT JOIN users u ON u.id = ub.user_id AND u.auth0_id = $2
         LEFT JOIN board_shares bs ON bs.board_id = b.board_id 
           AND bs.shared_with_user_id = $2 
           AND bs.permission_level = 'ADMIN'
         LIMIT 1`,
        [boardId, userId]
      );

      const hasSharePermission = permissionCheck.rows[0]?.can_share === true;

      if (!hasSharePermission) {
        throw new GraphQLError('You do not have permission to share this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Find the user to share with
      const userResult = await pool.query('SELECT auth0_id FROM users WHERE email = $1', [
        email,
      ]);

      if (userResult.rows.length === 0) {
        throw new GraphQLError('User not found with that email', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const sharedWithUserId = userResult.rows[0].auth0_id;

      // Check if user is trying to share with themselves
      if (sharedWithUserId === userId) {
        throw new GraphQLError('You cannot share a board with yourself', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check if already shared
      const existingShare = await pool.query(
        'SELECT id FROM board_shares WHERE board_id = $1 AND shared_with_user_id = $2',
        [boardId, sharedWithUserId]
      );

      if (existingShare.rows.length > 0) {
        throw new GraphQLError('Board is already shared with this user', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Create the share
      const result = await pool.query(
        `INSERT INTO board_shares (board_id, shared_with_user_id, shared_by_user_id, permission_level)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [boardId, sharedWithUserId, userId, permission]
      );

      // Get user details for response
      const shareWithDetails = await pool.query(
        `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
         FROM board_shares bs
         LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
         WHERE bs.id = $1`,
        [result.rows[0].id]
      );

      return shareWithDetails.rows[0];
    },

    // Update permission level of an existing share
    updateBoardShare: async (_: unknown, args: UpdateBoardShareArgs, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { shareId, permission } = args;

      // Get the share and check permissions
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

      // Update the permission
      await pool.query(
        `UPDATE board_shares 
         SET permission_level = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [permission, shareId]
      );

      // Get user details for response
      const updatedShare = await pool.query(
        `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
         FROM board_shares bs
         LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
         WHERE bs.id = $1`,
        [shareId]
      );

      return updatedShare.rows[0];
    },

    // Remove a share (revoke access)
    removeBoardShare: async (_: unknown, args: RemoveBoardShareArgs, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { shareId } = args;

      // Check if user has permission to remove share
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

      // Delete the share
      await pool.query('DELETE FROM board_shares WHERE id = $1', [shareId]);

      return true;
    },

    // Generate a public share link
    generateShareLink: async (_: unknown, args: GenerateShareLinkArgs, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { boardId } = args;

      // Check if user is owner
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

      // Generate a unique token
      const token = randomBytes(32).toString('hex');

      // Update board with token and set as public
      await pool.query(
        `UPDATE boards 
         SET share_token = $1, is_public = true 
         WHERE id = $2`,
        [token, boardId]
      );

      // Return the full share URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}/boards/shared/${token}`;
    },

    // Revoke public share link
    revokeShareLink: async (_: unknown, args: RevokeShareLinkArgs, context: any) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const { boardId } = args;

      // Check if user is owner
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

      // Remove token and set as private
      await pool.query(
        `UPDATE boards 
         SET share_token = NULL, is_public = false 
         WHERE id = $1`,
        [boardId]
      );

      return true;
    },
  },

  Board: {
    // Resolver for shares field on Board type
    shares: async (parent: any, _: unknown, context: any) => {
      const result = await pool.query(
        `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
         FROM board_shares bs
         LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
         WHERE bs.board_id = $1
         ORDER BY bs.created_at DESC`,
        [parent.id]
      );
      return result.rows;
    },

    // Check if board is shared
    isShared: async (parent: any) => {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM board_shares WHERE board_id = $1',
        [parent.id]
      );
      return parseInt(result.rows[0].count) > 0;
    },

    // Get current user's permission level
    myPermission: async (parent: any, _: unknown, context: any) => {
      const userId = context.user?.sub;
      if (!userId) return null;

      // Check if owner first
      const ownerCheck = await pool.query(
        `SELECT role FROM user_boards 
         WHERE board_id = $1 AND user_id = (
           SELECT id FROM users WHERE auth0_id = $2
         )`,
        [parent.id, userId]
      );

      if (ownerCheck.rows[0]?.role === 'OWNER') {
        return 'ADMIN'; // Owners have admin permissions
      }

      // Check shared permission
      const shareCheck = await pool.query(
        'SELECT permission_level FROM board_shares WHERE board_id = $1 AND shared_with_user_id = $2',
        [parent.id, userId]
      );

      return shareCheck.rows[0]?.permission_level || null;
    },

    // Get share token
    shareToken: async (parent: any, _: unknown, context: any) => {
      const userId = context.user?.sub;
      if (!userId) return null;

      // Only return token if user is owner
      const ownerCheck = await pool.query(
        `SELECT role FROM user_boards 
         WHERE board_id = $1 AND user_id = (
           SELECT id FROM users WHERE auth0_id = $2
         )`,
        [parent.id, userId]
      );

      if (ownerCheck.rows[0]?.role !== 'OWNER') {
        return null; // Non-owners can't see the token
      }

      return parent.share_token;
    },

    // Get public status
    isPublic: async (parent: any) => {
      return parent.is_public || false;
    },
  },

  BoardShare: {
    // Resolver for board field on BoardShare type
    board: async (parent: any) => {
      const result = await pool.query('SELECT * FROM boards WHERE id = $1', [
        parent.board_id,
      ]);
      return result.rows[0];
    },
  },
};
