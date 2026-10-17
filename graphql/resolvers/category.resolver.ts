import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '@/graphql/context';
import {
  createCategory,
  deleteCategory,
  getCategoriesByBoardId,
} from '@/src/entities/category/api/categoryRepository';
import {
  CategoryNameValidationError,
  normalizeCategoryName,
} from '@/src/entities/category/model/category';
import { checkBoardEditPermission, checkBoardViewPermission } from './permissions';

function requireUser(context: GraphQLContext): string {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user.sub;
}

async function requireEditPermission(boardId: string, userId: string) {
  if (!(await checkBoardEditPermission(boardId, userId))) {
    throw new GraphQLError(
      'You do not have permission to manage categories on this board',
      {
        extensions: { code: 'FORBIDDEN' },
      }
    );
  }
}

export const categoryResolvers = {
  Query: {},
  Mutation: {
    createCategory: async (
      _: unknown,
      { boardId, name }: { boardId: string; name: string },
      context: GraphQLContext
    ) => {
      const userId = requireUser(context);
      await requireEditPermission(boardId, userId);

      let normalizedName: string;
      try {
        normalizedName = normalizeCategoryName(name);
      } catch (error) {
        if (error instanceof CategoryNameValidationError) {
          throw new GraphQLError(error.message, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw error;
      }

      try {
        const category = await createCategory(boardId, normalizedName);
        if (!category) {
          throw new GraphQLError('Board not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }
        return category;
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === '23505'
        ) {
          throw new GraphQLError(
            'A category with this name already exists on this board',
            {
              extensions: { code: 'DUPLICATE' },
            }
          );
        }
        throw error;
      }
    },

    deleteCategory: async (
      _: unknown,
      { boardId, categoryId }: { boardId: string; categoryId: string },
      context: GraphQLContext
    ) => {
      const userId = requireUser(context);
      await requireEditPermission(boardId, userId);

      const result = await deleteCategory(boardId, categoryId);
      if (result.status === 'not_found') {
        throw new GraphQLError('Category not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      if (result.status === 'in_use') {
        throw new GraphQLError(
          `Cannot delete this category because ${result.itemCount} active ${
            result.itemCount === 1 ? 'item uses' : 'items use'
          } it`,
          {
            extensions: {
              code: 'CATEGORY_IN_USE',
              activeItemCount: result.itemCount,
            },
          }
        );
      }
      return true;
    },
  },

  Board: {
    categories: async (parent: { id: string }, _: unknown, context: GraphQLContext) => {
      const userId = requireUser(context);
      if (!(await checkBoardEditPermission(parent.id, userId))) {
        if (!(await checkBoardViewPermission(parent.id, userId))) {
          throw new GraphQLError('Forbidden', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }
      return getCategoriesByBoardId(parent.id);
    },
    canEdit: async (parent: { id: string }, _: unknown, context: GraphQLContext) =>
      context.user ? checkBoardEditPermission(parent.id, context.user.sub) : false,
  },
};
