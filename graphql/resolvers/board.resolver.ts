import { query, queryOne } from '@/lib/db';
import { GraphQLContext } from '@/graphql/context';

export const boardResolvers = {
  Query: {
    myBoards: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const userEmail = context.user.email;
      
      const userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
      );

      if (userResult.rows.length === 0) {
        return [];
      }

      const userId = userResult.rows[0].id;

      const result = await query(
        `SELECT b.*, ub.role 
         FROM boards b
         INNER JOIN user_boards ub ON b.id = ub.board_id
         WHERE ub.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );
      
      return result.rows;
    },
    
    board: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      console.log('Fetching board with id:', id);
      

      const result = await queryOne(
        'SELECT * FROM boards WHERE id = $1',
        [id]
      );

      return result;
    },
  },

  Board: {
    items: async (parent: any) => {
      console.log('🔍 Parent board object:', parent);
      console.log('🔍 Parent board ID:', parent.id);
      console.log('🔍 Parent board ID type:', typeof parent.id);
      
      const result = await query(
        `SELECT * FROM items 
         WHERE board_id = $1 AND deleted_at IS NULL
         ORDER BY category NULLS LAST, created_at ASC`,
        [parent.id]
      );
      
      console.log('📦 Items query result:', result);
      console.log('📦 Items rows:', result.rows);
      console.log('📦 Items row count:', result.rowCount);
      
      return result.rows || [];
    },
  },
};