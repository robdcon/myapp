import { GraphQLContext } from '@/graphql/context';
import { validateId } from '@/src/shared/lib';
import {
  getBoardById,
  getBoardsByUserId,
  getUserIdByEmail,
} from '@/src/entities/board/api/boardRepository';
import { getItemsForBoardDisplay } from '@/src/entities/item/api/itemRepository';
import { checkBoardViewPermission } from '@/graphql/resolvers/permissions';

export const boardResolvers = {
  Query: {
    myBoards: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const userId = await getUserIdByEmail(context.user.email);

      if (!userId) {
        return [];
      }

      return getBoardsByUserId(userId);
    },

    board: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      validateId(id, 'id');

      const board = await getBoardById(id);

      // Return null for non-existent boards without leaking existence information
      // to users who lack access.
      if (!board) {
        return null;
      }

      const hasPermission = await checkBoardViewPermission(id, context.user.sub);
      if (!hasPermission) {
        throw new Error('Forbidden');
      }

      return board;
    },
  },

  Board: {
    items: async (parent: { id: string }) => {
      return getItemsForBoardDisplay(parent.id);
    },
  },
};
