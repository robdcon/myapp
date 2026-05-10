import { GraphQLContext } from '@/graphql/context';
import { GraphQLError } from 'graphql';
import {
  checkBoardEditPermission,
  checkBoardViewPermission,
} from '@/graphql/resolvers/permissions';
import { validateId, validateStringField } from '@/src/shared/lib';
import {
  getBoardIdFromItemId,
  getUserIdByAuth0Id,
  getItemById,
  getItemsByBoardId,
  getUncheckedItemsByBoardId,
  toggleItemChecked,
  createItem,
  updateItem,
  softDeleteItem,
} from '@/src/entities/item/api/itemRepository';

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

      validateId(itemId, 'itemId');

      const userId = context.user.sub;
      const boardId = await getBoardIdFromItemId(itemId);

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

      return toggleItemChecked(itemId);
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

      validateId(boardId, 'boardId');
      validateStringField(name, 'name', { required: true, maxLength: 255 });
      validateStringField(details, 'details', { maxLength: 2000 });
      validateStringField(category, 'category', { maxLength: 100 });

      const userId = context.user.sub;

      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to add items to this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      try {
        const createdByUserId = await getUserIdByAuth0Id(userId);

        return createItem({ boardId, name, details, category, createdByUserId });
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

      validateId(itemId, 'itemId');
      // Validate each field only when the caller explicitly supplies it.
      if (name !== undefined) {
        validateStringField(name, 'name', { required: true, maxLength: 255 });
      }
      validateStringField(details, 'details', { maxLength: 2000 });
      validateStringField(category, 'category', { maxLength: 100 });

      const userId = context.user.sub;
      const boardId = await getBoardIdFromItemId(itemId);

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

      // Validate that at least one field is being changed before hitting the DB
      if (name === undefined && details === undefined && category === undefined) {
        throw new GraphQLError('No fields to update', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      try {
        return updateItem({ itemId, name, details, category });
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

      validateId(itemId, 'itemId');

      const userId = context.user.sub;
      const boardId = await getBoardIdFromItemId(itemId);

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

      await softDeleteItem(itemId);
      return true;
    },
  },

  Query: {
    item: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const boardId = await getBoardIdFromItemId(id);
      if (!boardId) {
        return null;
      }

      const hasPermission = await checkBoardViewPermission(boardId, context.user.sub);
      if (!hasPermission) {
        throw new Error('Forbidden');
      }

      return getItemById(id);
    },

    items: async (_: any, { boardId }: { boardId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const hasPermission = await checkBoardViewPermission(boardId, context.user.sub);
      if (!hasPermission) {
        throw new Error('Forbidden');
      }

      return getItemsByBoardId(boardId);
    },

    uncheckedItems: async (
      _: any,
      { boardId }: { boardId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const hasPermission = await checkBoardViewPermission(boardId, context.user.sub);
      if (!hasPermission) {
        throw new Error('Forbidden');
      }

      return getUncheckedItemsByBoardId(boardId);
    },
  },

  Item: {
    // Add any field resolvers for Item if necessary
  },
};
