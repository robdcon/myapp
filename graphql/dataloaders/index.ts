import DataLoader from 'dataloader';
import { pool } from '@/src/shared/lib/db';

export interface GraphQLDataLoaders {
  itemsByBoardId: DataLoader<string, any[]>;
  sharesByBoardId: DataLoader<string, any[]>;
  isSharedByBoardId: DataLoader<string, boolean>;
  permissionByBoardAndUser: DataLoader<{ boardId: string; userId: string }, string | null>;
  calendarStatusByBoardId: DataLoader<string, any | null>;
}

/**
 * Batch load items for a list of board IDs.
 */
async function batchItemsByBoardIds(boardIds: readonly string[]) {
  const result = await pool.query(
    `SELECT * FROM items 
     WHERE board_id = ANY($1::int[]) AND deleted_at IS NULL 
     ORDER BY category NULLS LAST, created_at ASC`,
    [boardIds]
  );

  const itemsByBoard = new Map<string, any[]>();
  for (const boardId of boardIds) {
    itemsByBoard.set(String(boardId), []);
  }

  for (const item of result.rows) {
    const key = String(item.board_id);
    if (itemsByBoard.has(key)) {
      itemsByBoard.get(key)!.push(item);
    }
  }

  return boardIds.map((id) => itemsByBoard.get(String(id)) || []);
}

/**
 * Batch load board shares for a list of board IDs.
 */
async function batchSharesByBoardIds(boardIds: readonly string[]) {
  const result = await pool.query(
    `SELECT bs.*, u.email as shared_with_user_email, u.name as shared_with_user_name
     FROM board_shares bs
     LEFT JOIN users u ON u.auth0_id = bs.shared_with_user_id
     WHERE bs.board_id = ANY($1::int[])
     ORDER BY bs.created_at DESC`,
    [boardIds]
  );

  const sharesByBoard = new Map<string, any[]>();
  for (const boardId of boardIds) {
    sharesByBoard.set(String(boardId), []);
  }

  for (const share of result.rows) {
    const key = String(share.board_id);
    if (sharesByBoard.has(key)) {
      sharesByBoard.get(key)!.push(share);
    }
  }

  return boardIds.map((id) => sharesByBoard.get(String(id)) || []);
}

/**
 * Batch check if boards are shared.
 */
async function batchIsSharedByBoardIds(boardIds: readonly string[]) {
  const result = await pool.query(
    `SELECT board_id, COUNT(*)::int as count 
     FROM board_shares 
     WHERE board_id = ANY($1::int[])
     GROUP BY board_id`,
    [boardIds]
  );

  const sharedSet = new Set<string>();
  for (const row of result.rows) {
    if (row.count > 0) {
      sharedSet.add(String(row.board_id));
    }
  }

  return boardIds.map((id) => sharedSet.has(String(id)));
}

/**
 * Batch load user permissions for (boardId, userId) pairs.
 */
async function batchPermissions(
  keys: readonly { boardId: string; userId: string }[]
) {
  if (keys.length === 0) return [];

  const boardIds = Array.from(new Set(keys.map((k) => k.boardId)));
  const userId = keys[0].userId;

  const result = await pool.query(
    `SELECT 
       b.id as board_id,
       ub.role as owner_role,
       bs.permission_level as shared_permission
     FROM unnest($1::int[]) AS b(id)
     LEFT JOIN users u ON u.auth0_id = $2
     LEFT JOIN user_boards ub ON ub.board_id = b.id AND ub.user_id = u.id
     LEFT JOIN board_shares bs ON bs.board_id = b.id AND bs.shared_with_user_id = $2`,
    [boardIds, userId]
  );

  const permMap = new Map<string, string | null>();
  for (const row of result.rows) {
    const key = String(row.board_id);
    if (row.owner_role === 'OWNER') {
      permMap.set(key, 'ADMIN');
    } else if (row.shared_permission) {
      permMap.set(key, row.shared_permission);
    } else {
      permMap.set(key, null);
    }
  }

  return keys.map((k) => permMap.get(String(k.boardId)) || null);
}

/**
 * Batch load calendar sync status for a list of board IDs.
 */
async function batchCalendarStatuses(boardIds: readonly string[]) {
  const result = await pool.query(
    `SELECT id, google_calendar_id, google_calendar_name, calendar_last_sync_at, sync_range_days
     FROM boards
     WHERE id = ANY($1::int[])`,
    [boardIds]
  );

  const statusMap = new Map<string, any>();
  for (const row of result.rows) {
    statusMap.set(String(row.id), {
      isConnected: Boolean(row.google_calendar_id),
      calendarId: row.google_calendar_id || null,
      calendarName: row.google_calendar_name || null,
      lastSyncAt: row.calendar_last_sync_at
        ? new Date(row.calendar_last_sync_at).toISOString()
        : null,
      syncRangeDays: row.sync_range_days || 30,
    });
  }

  return boardIds.map((id) => statusMap.get(String(id)) || null);
}

export function createLoaders(currentUserId?: string | null): GraphQLDataLoaders {
  return {
    itemsByBoardId: new DataLoader(batchItemsByBoardIds),
    sharesByBoardId: new DataLoader(batchSharesByBoardIds),
    isSharedByBoardId: new DataLoader(batchIsSharedByBoardIds),
    permissionByBoardAndUser: new DataLoader((keys) => batchPermissions(keys), {
      cacheKeyFn: (key) => `${key.boardId}:${key.userId}`,
    }),
    calendarStatusByBoardId: new DataLoader(batchCalendarStatuses),
  };
}
