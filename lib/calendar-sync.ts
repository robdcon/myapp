import { pool } from '@/lib/db';
import {
  listEvents,
  decryptToken,
  getValidAccessToken,
  encryptToken,
} from '@/lib/google-calendar';

/**
 * Calendar Sync Logic
 * Syncs Google Calendar events to board items
 */

interface SyncResult {
  success: boolean;
  itemsCreated: number;
  itemsUpdated: number;
  itemsDeleted: number;
  error?: string;
}

interface BoardCalendarInfo {
  id: number;
  google_calendar_id: string;
  google_calendar_name: string;
  google_access_token: string;
  google_refresh_token: string;
  google_token_expires_at: Date;
  calendar_sync_range_days: number;
}

/**
 * Sync a board with its connected Google Calendar
 * @param boardId - Board ID to sync
 * @returns Sync result with statistics
 */
export async function syncBoardCalendar(boardId: string | number): Promise<SyncResult> {
  try {
    // 1. Get board calendar info
    const boardQuery = await pool.query<BoardCalendarInfo>(
      `SELECT id, google_calendar_id, google_calendar_name, 
              google_access_token, google_refresh_token, 
              google_token_expires_at, calendar_sync_range_days
       FROM boards 
       WHERE id = $1 AND board_type = 'EVENTS'`,
      [boardId]
    );

    if (boardQuery.rows.length === 0) {
      return {
        success: false,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsDeleted: 0,
        error: 'Board not found or not an Events board',
      };
    }

    const board = boardQuery.rows[0];

    if (
      !board.google_calendar_id ||
      !board.google_access_token ||
      !board.google_refresh_token
    ) {
      return {
        success: false,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsDeleted: 0,
        error: 'Board calendar not fully configured',
      };
    }

    // 2. Decrypt tokens and get valid access token
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

    // 3. If token was refreshed, update database
    if (wasRefreshed) {
      const encryptedToken = encryptToken(validToken);
      await pool.query(
        'UPDATE boards SET google_access_token = $1, google_token_expires_at = $2 WHERE id = $3',
        [encryptedToken, expiresAt, boardId]
      );
    }

    // 4. Fetch events from Google Calendar
    const events = await listEvents(
      validToken,
      board.google_calendar_id,
      board.calendar_sync_range_days
    );

    console.log(`📅 Fetched ${events.length} events from Google Calendar`);

    // 5. Get existing synced items for this board
    const existingItemsQuery = await pool.query(
      `SELECT id, google_event_id, name, event_start_time, event_end_time, 
              event_description, google_calendar_link
       FROM items 
       WHERE board_id = $1 AND google_event_id IS NOT NULL`,
      [boardId]
    );

    const existingItems = new Map(
      existingItemsQuery.rows.map((item) => [item.google_event_id, item])
    );

    let itemsCreated = 0;
    let itemsUpdated = 0;

    // 6. Process each event
    for (const event of events) {
      const existingItem = existingItems.get(event.id);

      // Format event name: "Event Title (Jan 22, 2:00 PM - 3:00 PM)"
      const eventName = formatEventName(
        event.summary,
        event.startTime,
        event.endTime,
        event.isAllDay
      );

      if (existingItem) {
        // Update existing item if changed
        const hasChanged =
          existingItem.name !== eventName ||
          existingItem.event_start_time?.toISOString() !==
            new Date(event.startTime).toISOString() ||
          existingItem.event_end_time?.toISOString() !==
            new Date(event.endTime).toISOString() ||
          existingItem.event_description !== (event.description || null) ||
          existingItem.google_calendar_link !== event.htmlLink;

        if (hasChanged) {
          await pool.query(
            `UPDATE items 
             SET name = $1, 
                 event_start_time = $2, 
                 event_end_time = $3,
                 event_description = $4,
                 google_calendar_link = $5
             WHERE id = $6`,
            [
              eventName,
              new Date(event.startTime),
              new Date(event.endTime),
              event.description || null,
              event.htmlLink,
              existingItem.id,
            ]
          );
          itemsUpdated++;
          console.log(`✏️ Updated event: ${event.summary}`);
        }

        // Mark as processed
        existingItems.delete(event.id);
      } else {
        // Create new item
        await pool.query(
          `INSERT INTO items (
            board_id, name, details, category, is_checked,
            google_event_id, event_start_time, event_end_time,
            event_description, google_calendar_link
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            boardId,
            eventName,
            event.location || null, // Store location in details field
            'Event', // Default category
            false, // Not checked by default
            event.id,
            new Date(event.startTime),
            new Date(event.endTime),
            event.description || null,
            event.htmlLink,
          ]
        );
        itemsCreated++;
        console.log(`➕ Created event: ${event.summary}`);
      }
    }

    // 7. Delete items for events that no longer exist (optional - commented out)
    // This removes events that are outside the sync range or were deleted
    let itemsDeleted = 0;
    if (existingItems.size > 0) {
      const itemIdsToDelete = Array.from(existingItems.values()).map((item) => item.id);
      await pool.query('DELETE FROM items WHERE id = ANY($1)', [itemIdsToDelete]);
      itemsDeleted = itemIdsToDelete.length;
      console.log(`🗑️ Deleted ${itemsDeleted} old events`);
    }

    // 8. Update last sync timestamp
    await pool.query('UPDATE boards SET calendar_last_sync_at = NOW() WHERE id = $1', [
      boardId,
    ]);

    console.log(`✅ Sync complete: +${itemsCreated} ~${itemsUpdated} -${itemsDeleted}`);

    return {
      success: true,
      itemsCreated,
      itemsUpdated,
      itemsDeleted,
    };
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return {
      success: false,
      itemsCreated: 0,
      itemsUpdated: 0,
      itemsDeleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format event name with date/time
 * @param summary - Event title
 * @param startTime - Start time ISO string
 * @param endTime - End time ISO string
 * @param isAllDay - Whether it's an all-day event
 * @returns Formatted event name
 */
function formatEventName(
  summary: string,
  startTime: string,
  endTime: string,
  isAllDay: boolean
): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isAllDay) {
    // All-day event: "Event Title (Jan 22)"
    const dateStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${summary} (${dateStr})`;
  } else {
    // Timed event: "Event Title (Jan 22, 2:00 PM - 3:00 PM)"
    const dateStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const startTimeStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const endTimeStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${summary} (${dateStr}, ${startTimeStr} - ${endTimeStr})`;
  }
}

/**
 * Get sync status for a board
 * @param boardId - Board ID
 * @returns Sync status information
 */
export async function getBoardSyncStatus(boardId: string | number) {
  const result = await pool.query(
    `SELECT google_calendar_id, google_calendar_name, 
            calendar_last_sync_at, calendar_sync_range_days,
            calendar_connected_by
     FROM boards 
     WHERE id = $1`,
    [boardId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const board = result.rows[0];

  return {
    isConnected: !!board.google_calendar_id,
    calendarId: board.google_calendar_id,
    calendarName: board.google_calendar_name,
    lastSyncAt: board.calendar_last_sync_at,
    syncRangeDays: board.calendar_sync_range_days,
    connectedBy: board.calendar_connected_by,
  };
}

/**
 * Update sync range for a board
 * @param boardId - Board ID
 * @param days - Number of days forward to sync
 */
export async function updateSyncRange(
  boardId: string | number,
  days: number
): Promise<void> {
  if (days < 1 || days > 365) {
    throw new Error('Sync range must be between 1 and 365 days');
  }

  await pool.query('UPDATE boards SET calendar_sync_range_days = $1 WHERE id = $2', [
    days,
    boardId,
  ]);
}
