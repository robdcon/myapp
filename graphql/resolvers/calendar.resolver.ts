import { GraphQLContext } from '../context';
import { pool } from '@/lib/db';
import {
  syncBoardCalendar,
  getBoardSyncStatus,
  updateSyncRange,
} from '@/lib/calendar-sync';
import {
  listCalendars,
  decryptToken,
  getValidAccessToken,
  encryptToken,
} from '@/lib/google-calendar';
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
        throw new Error('You must be logged in');
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to manage this board');
      }

      // Get board calendar tokens
      const boardQuery = await pool.query(
        `SELECT google_access_token, google_refresh_token, google_token_expires_at
         FROM boards 
         WHERE id = $1 AND board_type = 'EVENTS'`,
        [boardId]
      );

      if (boardQuery.rows.length === 0) {
        throw new Error('Board not found or not an Events board');
      }

      const board = boardQuery.rows[0];

      if (!board.google_access_token || !board.google_refresh_token) {
        throw new Error('Board is not connected to Google Calendar');
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
        throw new Error('You must be logged in');
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
        throw new Error('Board not found or no permission');
      }

      const status = await getBoardSyncStatus(boardId);

      if (!status) {
        throw new Error('Board not found');
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
        throw new Error('You must be logged in');
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to manage this board');
      }

      // Update board with selected calendar
      await pool.query(
        `UPDATE boards 
         SET google_calendar_id = $1, google_calendar_name = $2
         WHERE id = $3`,
        [calendarId, calendarName, boardId]
      );

      console.log(`✅ Calendar ${calendarName} selected for board ${boardId}`);

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
        throw new Error('You must be logged in');
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to sync this board');
      }

      console.log(`🔄 Starting calendar sync for board ${boardId}...`);
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
        throw new Error('You must be logged in');
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to manage this board');
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

      console.log(`✅ Calendar disconnected from board ${boardId}`);

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
        throw new Error('You must be logged in');
      }

      const userId = context.user.sub;

      // Check permission
      const hasPermission = await checkBoardEditPermission(boardId, userId);
      if (!hasPermission) {
        throw new Error('You do not have permission to manage this board');
      }

      await updateSyncRange(boardId, days);

      console.log(`✅ Sync range updated to ${days} days for board ${boardId}`);

      return true;
    },
  },

  Board: {
    /**
     * Add calendar status to Board type
     */
    calendarStatus: async (parent: any, _: any, context: GraphQLContext) => {
      // Only fetch if user has permission (already checked in board resolver)
      const status = await getBoardSyncStatus(parent.id);
      return status;
    },
  },
};
