import { query } from '@/lib/db';
import { GraphQLContext } from '@/graphql/context';

export const boardResolvers = {
  Query: {
    myBoards: async (_: any, __: any, context: GraphQLContext) => {
      console.log('🔍 Full context object:', JSON.stringify(context, null, 2));
      console.log('🔍 Context user:', context.user);
      
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const userEmail = context.user.email;
      
      console.log('📧 User email from context:', userEmail);
      console.log('📧 Email type:', typeof userEmail);

      // First get the user from the users table
      const userResult = await query(
        'SELECT id, email FROM users WHERE email = $1',
        [userEmail]
      );

      console.log('👤 User query result:', userResult.rows);
      console.log('👤 Row count:', userResult.rowCount);

      if (userResult.rows.length === 0) {
        // Let's also check all users in the database
        const allUsers = await query('SELECT id, email FROM users');
        console.log('📋 All users in database:', allUsers.rows);
        console.log('⚠️ User not found in database for email:', userEmail);
        return [];
      }

      const userId = userResult.rows[0].id;
      console.log('✅ Found user ID:', userId);

      // Now get boards through the user_boards join table
      const result = await query(
        `SELECT b.*, ub.role 
         FROM boards b
         INNER JOIN user_boards ub ON b.id = ub.board_id
         WHERE ub.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
      );
      
      console.log('📋 Boards query result:', result.rows);
      
      return result.rows;
    },
  },
};