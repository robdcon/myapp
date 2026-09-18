import { GraphQLContext } from '../context';
import { GraphQLError } from 'graphql';
import { pool } from '@/src/shared/lib/db';
import {
  syncBoardCalendar,
  getBoardSyncStatus,
  updateSyncRange,
} from '@/src/shared/lib/calendar-sync';
import {
  listCalendars,
  decryptToken,
  getValidAccessToken,
  encryptToken,
} from '@/src/shared/lib/google-calendar';
import { checkBoardEditPermission } from './permissions';

export const calendarResolvers = {
  Query: {
    /**
     * Get available Google Calendars for a board
     */
    availableCalendars: async (
      _: any,
      { boardId }: { boardId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to manage this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Get board calendar tokens
      const boardQuery = await pool.query(
        `SELECT google_access_token, google_refresh_token, google_token_expires_at
         FROM boards 
         WHERE id = $1 AND board_type = 'EVENTS'`,
        [boardId]
      );

      if (boardQuery.rows.length === 0) {
        throw new GraphQLError('Board not found or not an Events board', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const board = boardQuery.rows[0];

      if (!board.google_access_token || !board.google_refresh_token) {
        throw new GraphQLError('Board is not connected to Google Calendar', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Decrypt and get valid token
      const accessToken = decryptToken(board.google_access_token);
      const refreshToken = decryptToken(board.google_refresh_token);

      const {
        accessToken: validToken,
        wasRefreshed,
        expiresAt,
      } = await getValidAccessToken(
        accessToken,
        refreshToken,
        board.google_token_expires_at
      );

      // Update token if refreshed
      if (wasRefreshed) {
        const encryptedToken = encryptToken(validToken);
        await pool.query(
          'UPDATE boards SET google_access_token = $1, google_token_expires_at = $2 WHERE id = $3',
          [encryptedToken, expiresAt, boardId]
        );
      }

      // Fetch calendars
      const calendars = await listCalendars(validToken);

      return calendars.map((cal) => ({
        id: cal.id,
        name: cal.name,
        description: cal.description,
        primary: cal.primary,
      }));
    },

    /**
     * Get calendar sync status for a board
     */
    calendarSyncStatus: async (
      _: any,
      { boardId }: { boardId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;

      // Check if user has access to this board (any permission level)
      const permissionCheck = await pool.query(
        `SELECT ub.role
         FROM user_boards ub
         JOIN users u ON ub.user_id = u.id
         WHERE u.auth0_id = $1 AND ub.board_id = $2`,
        [userId, boardId]
      );

      if (permissionCheck.rows.length === 0) {
        throw new GraphQLError('Board not found or no permission', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const status = await getBoardSyncStatus(boardId);

      if (!status) {
        throw new GraphQLError('Board not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return status;
    },
  },

  Mutation: {
    /**
     * Select which calendar to sync with the board
     */
    selectBoardCalendar: async (
      _: any,
      {
        boardId,
        calendarId,
        calendarName,
      }: { boardId: string; calendarId: string; calendarName: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to manage this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Update board with selected calendar
      await pool.query(
        `UPDATE boards 
         SET google_calendar_id = $1, google_calendar_name = $2
         WHERE id = $3`,
        [calendarId, calendarName, boardId]
      );

      return true;
    },

    /**
     * Sync board with Google Calendar
     */
    syncBoardCalendar: async (
      _: any,
      { boardId }: { boardId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to sync this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const result = await syncBoardCalendar(boardId);

      return {
        success: result.success,
        message: result.error || 'Calendar synced successfully',
        itemsCreated: result.itemsCreated,
        itemsUpdated: result.itemsUpdated,
        itemsDeleted: result.itemsDeleted,
      };
    },

    /**
     * Disconnect Google Calendar from board
     */
    disconnectBoardCalendar: async (
      _: any,
      { boardId }: { boardId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to manage this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Clear calendar connection
      await pool.query(
        `UPDATE boards 
         SET google_calendar_id = NULL,
             google_calendar_name = NULL,
             google_access_token = NULL,
             google_refresh_token = NULL,
             google_token_expires_at = NULL,
             calendar_last_sync_at = NULL,
             calendar_connected_by = NULL
         WHERE id = $1`,
        [boardId]
      );

      return true;
    },

    /**
     * Update calendar sync range (days forward)
     */
    updateCalendarSyncRange: async (
      _: any,
      { boardId, days }: { boardId: string; days: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new GraphQLError('You do not have permission to manage this board', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await updateSyncRange(boardId, days);

      return true;
    },
  },

  Board: {
    /**
     * Add calendar status to Board type using DataLoader to prevent N+1 queries
     */
    calendarStatus: async (parent: any, _: any, context: GraphQLContext) => {
      return context.loaders.calendarStatusByBoardId.load(parent.id);
    },
  },
};
