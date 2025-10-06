import { query, queryOne } from '@/lib/db';

export const userResolvers = {
  Query: {
    users: async () => {
      const result = await query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    },
    user: async (_: any, { id }: { id: string }) => {
      return await queryOne('SELECT * FROM users WHERE id = $1', [id]);
    },
  },
  
  Mutation: {
    createUser: async (_: any, { name, email }: { name: string; email: string }) => {
      const result = await queryOne(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      return result;
    },
  },
  
  User: {
    boards: async (parent: any) => {
      const result = await query(
        'SELECT * FROM boards WHERE user_id = $1',
        [parent.id]
      );
      return result.rows;
    },
  },
};