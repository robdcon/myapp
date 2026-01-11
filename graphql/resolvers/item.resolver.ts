import { query, queryOne } from '@/lib/db';
import { GraphQLContext } from '@/graphql/context';
import { pool } from '@/lib/db';
import { GraphQLError } from 'graphql';

// Helper function to check if user has edit permission on a board
async function checkBoardEditPermission(
  boardId: string,
  userId: string
): Promise<boolean> {
  console.log('========== Permission Check Debug ==========');
  console.log('Checking permission for:', { boardId, userId });

  // First check: user_boards (owner/member)
  const userBoardsCheck = await pool.query(
    `SELECT ub.*, u.auth0_id, u.email, u.id as user_db_id
     FROM user_boards ub
     JOIN users u ON ub.user_id = u.id
     WHERE ub.board_id = $1`,
    [boardId]
  );
  console.log('user_boards entries for this board:', userBoardsCheck.rows);

  // Second check: board_shares (shared with user)
  const boardSharesCheck = await pool.query(
    `SELECT bs.*, u.email
     FROM board_shares bs
     LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
     WHERE bs.board_id = $1`,
    [boardId]
  );
  console.log('board_shares entries for this board:', boardSharesCheck.rows);

  // Now run the actual permission check
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

  console.log('Permission check result:', result.rows[0]);
  console.log('===========================================');
  return Boolean(result.rows[0]?.has_permission);
}

// Helper function to get board_id from item_id
async function getBoardIdFromItem(itemId: string): Promise<string | null> {
  const result = await pool.query('SELECT board_id FROM items WHERE id = $1', [itemId]);
  return result.rows[0]?.board_id || null;
}

export const itemResolvers = {
  Mutation: {
    toggleItemCheck: async (
      _: any,
      { itemId }: { itemId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;
      const boardId = await getBoardIdFromItem(itemId);

      if (!boardId) {
        throw new GraphQLError('Item not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to edit items on this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const result = await queryOne(
        `UPDATE items 
         SET is_checked = NOT is_checked, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 
         RETURNING *`,
        [itemId]
      );

      return result;
    },

    createItem: async (
      _: any,
      {
        boardId,
        name,
        details,
        category,
      }: {
        boardId: string;
        name: string;
        details?: string;
        category?: string;
      },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;
      console.log('========== CreateItem Debug ==========');
      console.log('BoardId:', boardId);
      console.log('UserId (auth0_id):', userId);
      console.log('Item Name:', name);

      // Check if user exists in database
      const userCheck = await pool.query(
        'SELECT id, auth0_id, email FROM users WHERE auth0_id = $1',
        [userId]
      );
      console.log('User in database:', userCheck.rows[0]);

      const hasPermission = await checkBoardEditPermission(boardId, userId);
      console.log('Has Permission:', hasPermission);
      console.log('=====================================');

      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to add items to this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      try {
        // Get the database user ID for created_by field
        const userResult = await pool.query('SELECT id FROM users WHERE auth0_id = $1', [
          userId,
        ]);

        const dbUserId = userResult.rows[0]?.id;

        const result = await queryOne(
          `INSERT INTO items (board_id, name, details, category, created_by, is_checked)
                     VALUES ($1, $2, $3, $4, $5, false)
                     RETURNING *`,
          [boardId, name, details, category, dbUserId]
        );

        return result;
      } catch (error: any) {
        if (error.code === '23505') {
          throw new GraphQLError(`Item "${name}" already exists on this board`, {
            extensions: { code: 'DUPLICATE' },
          });
        }
        throw error;
      }
    },

    updateItem: async (
      _: any,
      {
        itemId,
        name,
        details,
        category,
      }: {
        itemId: string;
        name?: string;
        details?: string;
        category?: string;
      },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;
      const boardId = await getBoardIdFromItem(itemId);

      if (!boardId) {
        throw new GraphQLError('Item not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to edit items on this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (details !== undefined) {
        updates.push(`details = $${paramCount++}`);
        values.push(details);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramCount++}`);
        values.push(category);
      }

      if (updates.length === 0) {
        throw new GraphQLError('No fields to update', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(itemId);

      try {
        const result = await queryOne(
          `UPDATE items 
                 SET ${updates.join(', ')}
                 WHERE id = $${paramCount}
                 RETURNING *`,
          values
        );

        return result;
      } catch (error: any) {
        if (error.code === '23505') {
          throw new GraphQLError(`Item "${name}" already exists on this board`, {
            extensions: { code: 'DUPLICATE' },
          });
        }
        throw error;
      }
    },

    deleteItem: async (
      _: any,
      { itemId }: { itemId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;
      const boardId = await getBoardIdFromItem(itemId);

      if (!boardId) {
        throw new GraphQLError('Item not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError(
          'You do not have permission to delete items on this board',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      await query(`UPDATE items SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [
        itemId,
      ]);

      return true;
    },
  },

  Query: {
    item: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const result = await queryOne('SELECT * FROM items WHERE id = $1', [id]);

      return result;
    },
    items: async (_: any, { boardId }: { boardId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const result = await query(
        `SELECT * FROM items 
                WHERE board_id = $1 AND deleted_at IS NULL
                ORDER BY category NULLS LAST, created_at ASC`,
        [boardId]
      );

      return result.rows || [];
    },

    uncheckedItems: async (
      _: any,
      { boardId }: { boardId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const result = await query(
        `SELECT * FROM items 
                WHERE board_id = $1 AND is_checked = false AND deleted_at IS NULL
                ORDER BY category NULLS LAST, created_at ASC`,
        [boardId]
      );
      return result.rows || [];
    },
  },

  Item: {
    // Add any field resolvers for Item if necessary
  },
};
