import { query, queryOne } from '@/lib/db';
import { GraphQLContext } from '@/graphql/context';
import { Query } from 'pg';

export const itemResolvers = {
    Mutation: {
        toggleItemCheck: async (_: any, { itemId }: { itemId: string }, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated');
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
    },

    Query: {
        item: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated');
            }

            const result = await queryOne(
                'SELECT * FROM items WHERE id = $1',
                [id]
            );

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
    },

    Item: {
        // Add any field resolvers for Item if necessary
    },
};