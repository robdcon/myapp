import { query, queryOne } from '@/src/shared/lib/db';
import { getBoardsByUserId } from '@/src/entities/board/api/boardRepository';

export const userResolvers = {
  Query: {
    users: async () => {
      const result = await query('SELECT * FROM users');
      return result.rows;
    },
    user: async (_: any, { email }: { email: string }) => {
      return await queryOne('SELECT * FROM users WHERE email = $1', [email]);
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
      return getBoardsByUserId(parent.id);
    },
  },
};
