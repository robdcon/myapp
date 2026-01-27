import { query, queryOne } from '@/lib/db';
import { GraphQLContext } from '@/graphql/context';

export const boardResolvers = {
  Query: {
    myBoards: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const userEmail = context.user.email;

      const userResult = await query('SELECT id FROM users WHERE email = $1', [
        userEmail,
      ]);

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

      const result = await queryOne('SELECT * FROM boards WHERE id = $1', [id]);

      return result;
    },
  },

  Board: {
    items: async (parent: any) => {
      const result = await query(
        `SELECT 
           id,
           board_id,
           name,
           details,
           is_checked,
           category,
           created_at,
           updated_at,
           google_event_id,
           EXTRACT(EPOCH FROM event_start_time)::bigint * 1000 as event_start_time,
           EXTRACT(EPOCH FROM event_end_time)::bigint * 1000 as event_end_time,
           event_description,
           google_calendar_link,
           deleted_at
         FROM items 
         WHERE board_id = $1 AND deleted_at IS NULL
         ORDER BY category NULLS LAST, created_at ASC`,
        [parent.id]
      );

      // Convert timestamps to ISO strings for proper serialization
      const items = result.rows.map((item: any) => ({
        ...item,
        // Keep numeric timestamps as strings for GraphQL
        event_start_time: item.event_start_time ? String(item.event_start_time) : null,
        event_end_time: item.event_end_time ? String(item.event_end_time) : null,
      }));

      return items;
    },
  },
};
