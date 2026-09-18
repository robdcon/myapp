import { GraphQLContext } from '@/graphql/context';
import { GraphQLError } from 'graphql';
import { validateId, validateStringField } from '@/src/shared/lib';
import {
  getBoardById,
  getBoardsByUserId,
  getUserIdByEmail,
  getUserIdByAuth0Id,
  createBoard,
  updateBoardFields,
  deleteBoardById,
} from '@/src/entities/board/api/boardRepository';
import { getItemsForBoardDisplay } from '@/src/entities/item/api/itemRepository';
import {
  checkBoardViewPermission,
  checkBoardEditPermission,
  checkBoardOwnerPermission,
} from '@/graphql/resolvers/permissions';

export const boardResolvers = {
  Mutation: {
    createBoard: async (
      _: any,
      {
        name,
        board_type,
        description,
      }: { name: string; board_type: string; description?: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      validateStringField(name, 'name', { required: true, maxLength: 255 });
      validateStringField(description, 'description', { maxLength: 2000 });

      const ownerUserId = context.dbUser?.id ?? (await getUserIdByAuth0Id(context.user.sub));

      if (!ownerUserId) {
        throw new GraphQLError(
          'Your account is not fully registered yet. Please try again shortly.',
          { extensions: { code: 'NOT_FOUND' } }
        );
      }

      return createBoard({
        name: name.trim(),
        boardType: board_type,
        description: description?.trim() || null,
        ownerUserId,
      });
    },

    updateBoard: async (
      _: any,
      { id, name, description }: { id: string; name?: string; description?: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      validateId(id, 'id');
      if (name !== undefined) {
        validateStringField(name, 'name', { required: true, maxLength: 255 });
      }
      validateStringField(description, 'description', { maxLength: 2000 });

      const hasPermission = await checkBoardEditPermission(id, context.user.sub);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to edit this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (name === undefined && description === undefined) {
        throw new GraphQLError('No fields to update', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const updated = await updateBoardFields({ id, name, description });
      if (!updated) {
        throw new GraphQLError('Board not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return updated;
    },

    deleteBoard: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      validateId(id, 'id');

      const isOwner = await checkBoardOwnerPermission(id, context.user.sub);
      if (!isOwner) {
        throw new GraphQLError('Only the board owner can delete this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await deleteBoardById(id);
      return true;
    },
  },

  Query: {
    myBoards: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.dbUser?.id ?? (await getUserIdByEmail(context.user.email));

      if (!userId) {
        return [];
      }

      return getBoardsByUserId(userId);
    },

    board: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      validateId(id, 'id');

      const board = await getBoardById(id);
      console.log(`Fetched board with id: ${id}:`, board);

      // Return null for non-existent boards without leaking existence information
      // to users who lack access.
      if (!board) {
        return null;
      }

      return board;
    },
  },

  Board: {
    items: async (parent: { id: string }, _: any, context: GraphQLContext) => {
      return context.loaders.itemsByBoardId.load(parent.id);
    },
  },
};
