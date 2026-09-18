import { GraphQLContext } from '@/graphql/context';
import { GraphQLError } from 'graphql';
import {
  checkUserHasAdminAccess,
  getBoardShares,
  getSharedBoards,
  createBoardShare,
  updateBoardSharePermission,
  deleteBoardShare,
  createShareLink,
  deleteShareLink,
} from '@/src/entities/board-share/api/boardShareRepository';
import { getBoardById } from '@/src/entities/board/api/boardRepository';

interface ShareBoardArgs {
  boardId: string;
  email: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
}

interface UpdateBoardShareArgs {
  shareId: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
}

export const boardShareResolvers = {
  Query: {
    // Get all shares for a specific board
    boardShares: async (_: unknown, { boardId }: { boardId: string }, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const hasAdminAccess = await checkUserHasAdminAccess(boardId, userId);
      if (!hasAdminAccess) {
        throw new GraphQLError(
          'You do not have permission to view shares for this board',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      return getBoardShares(boardId);
    },

    // Get boards shared with the current user
    sharedBoards: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return getSharedBoards(userId);
    },
  },

  Mutation: {
    // Share a board with another user by email
    shareBoard: async (_: unknown, args: ShareBoardArgs, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const hasSharePermission = await checkUserHasAdminAccess(args.boardId, userId);
      if (!hasSharePermission) {
        throw new GraphQLError('You do not have permission to share this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return createBoardShare(args.boardId, args.email, args.permission, userId);
    },

    // Update permission level of an existing share
    updateBoardShare: async (_: unknown, args: UpdateBoardShareArgs, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return updateBoardSharePermission(args.shareId, args.permission, userId);
    },

    // Remove a share (revoke access)
    removeBoardShare: async (_: unknown, { shareId }: { shareId: string }, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return deleteBoardShare(shareId, userId);
    },

    // Generate a public share link
    generateShareLink: async (_: unknown, { boardId }: { boardId: string }, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return createShareLink(boardId, userId);
    },

    // Revoke public share link
    revokeShareLink: async (_: unknown, { boardId }: { boardId: string }, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return deleteShareLink(boardId, userId);
    },
  },

  Board: {
    // Resolver for shares field on Board type
    shares: async (parent: any, _: unknown, context: GraphQLContext) => {
      return context.loaders.sharesByBoardId.load(parent.id);
    },

    // Check if board is shared
    isShared: async (parent: any, _: unknown, context: GraphQLContext) => {
      return context.loaders.isSharedByBoardId.load(parent.id);
    },

    // Get current user's permission level
    myPermission: async (parent: any, _: unknown, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) return null;
      return context.loaders.permissionByBoardAndUser.load({
        boardId: parent.id,
        userId,
      });
    },

    // Get share token
    shareToken: async (parent: any, _: unknown, context: GraphQLContext) => {
      const userId = context.user?.sub;
      if (!userId) return null;

      // Use DataLoader permission check to determine if user is owner/admin
      const perm = await context.loaders.permissionByBoardAndUser.load({
        boardId: parent.id,
        userId,
      });

      if (perm !== 'ADMIN' && perm !== 'OWNER') {
        return null;
      }

      return parent.share_token;
    },

    // Get public status
    isPublic: async (parent: any) => {
      return parent.is_public || false;
    },
  },

  BoardShare: {
    // Resolver for board field on BoardShare type
    board: async (parent: any) => {
      return getBoardById(parent.board_id);
    },
  },
};
