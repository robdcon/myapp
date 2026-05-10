import 'server-only';
import { query, queryOne } from '@/src/shared/lib/db';
import { Item } from '../model/types';

/**
 * Resolve the internal database user id for a given Auth0 user id.
 * Returns null if the user does not exist.
 */
export async function getUserIdByAuth0Id(auth0Id: string): Promise<string | null> {
  const result = await query<{ id: string }>('SELECT id FROM users WHERE auth0_id = $1', [
    auth0Id,
  ]);
  return result.rows[0]?.id ?? null;
}

/**
 * Resolve the board id that an item belongs to.
 * Returns null if the item does not exist.
 */
export async function getBoardIdFromItemId(itemId: string): Promise<string | null> {
  const result = await query<{ board_id: string }>(
    'SELECT board_id FROM items WHERE id = $1',
    [itemId]
  );
  return result.rows[0]?.board_id ?? null;
}

/**
 * Fetch a single item by its id.
 * Returns null if not found.
 */
export async function getItemById(id: string): Promise<Item | null> {
  const row = await queryOne('SELECT * FROM items WHERE id = $1', [id]);
  return row ?? null;
}

/**
 * Fetch all active (non-deleted) items for a board,
 * ordered by category (nulls last) then creation date ascending.
 */
export async function getItemsByBoardId(boardId: string): Promise<Item[]> {
  const result = await query<Item>(
    `SELECT * FROM items
     WHERE board_id = $1 AND deleted_at IS NULL
     ORDER BY category NULLS LAST, created_at ASC`,
    [boardId]
  );
  return result.rows;
}

/**
 * Fetch unchecked, active items for a board,
 * ordered by category (nulls last) then creation date ascending.
 */
export async function getUncheckedItemsByBoardId(boardId: string): Promise<Item[]> {
  const result = await query<Item>(
    `SELECT * FROM items
     WHERE board_id = $1 AND is_checked = false AND deleted_at IS NULL
     ORDER BY category NULLS LAST, created_at ASC`,
    [boardId]
  );
  return result.rows;
}

/**
 * Representation of an item as returned by the Board.items field resolver.
 * event_start_time and event_end_time are epoch-millisecond strings for GraphQL
 * serialisation (converted from EXTRACT EPOCH).
 */
export interface ItemDisplayRow extends Omit<
  Item,
  'event_start_time' | 'event_end_time'
> {
  event_start_time: string | null;
  event_end_time: string | null;
  deleted_at?: string | null;
}

/**
 * Fetch items for a board with epoch-millisecond timestamps, suitable for
 * use in the Board.items GraphQL field resolver.
 */
export async function getItemsForBoardDisplay(
  boardId: string
): Promise<ItemDisplayRow[]> {
  const result = await query<ItemDisplayRow>(
    `SELECT
       id,
       board_id,
       name,
       details,
       is_checked,
       category,
       created_at,
       updated_at,
       google_event_id,
       EXTRACT(EPOCH FROM event_start_time)::bigint * 1000 AS event_start_time,
       EXTRACT(EPOCH FROM event_end_time)::bigint * 1000   AS event_end_time,
       event_description,
       google_calendar_link,
       deleted_at
     FROM items
     WHERE board_id = $1 AND deleted_at IS NULL
     ORDER BY category NULLS LAST, created_at ASC`,
    [boardId]
  );

  return result.rows.map((item) => ({
    ...item,
    event_start_time: item.event_start_time ? String(item.event_start_time) : null,
    event_end_time: item.event_end_time ? String(item.event_end_time) : null,
  }));
}

/**
 * Toggle the is_checked flag on an item.
 * Returns the updated item, or null if the item was not found.
 */
export async function toggleItemChecked(itemId: string): Promise<Item | null> {
  const row = await queryOne(
    `UPDATE items
     SET is_checked = NOT is_checked, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [itemId]
  );
  return row ?? null;
}

export interface CreateItemParams {
  boardId: string;
  name: string;
  details?: string;
  category?: string;
  createdByUserId?: string | null;
}

/**
 * Insert a new item into a board.
 * Returns the created item.
 */
export async function createItem(params: CreateItemParams): Promise<Item | null> {
  const { boardId, name, details, category, createdByUserId } = params;
  const row = await queryOne(
    `INSERT INTO items (board_id, name, details, category, created_by, is_checked)
     VALUES ($1, $2, $3, $4, $5, false)
     RETURNING *`,
    [boardId, name, details, category, createdByUserId]
  );
  return row ?? null;
}

export interface UpdateItemParams {
  itemId: string;
  name?: string;
  details?: string;
  category?: string;
}

/**
 * Update editable fields on an existing item.
 * Returns the updated item, or null if no fields were supplied.
 */
export async function updateItem(params: UpdateItemParams): Promise<Item | null> {
  const { itemId, name, details, category } = params;
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (details !== undefined) {
    updates.push(`details = $${paramCount++}`);
    values.push(details);
  }
  if (category !== undefined) {
    updates.push(`category = $${paramCount++}`);
    values.push(category);
  }

  if (updates.length === 0) {
    return null;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(itemId);

  const row = await queryOne(
    `UPDATE items
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );
  return row ?? null;
}

/**
 * Soft-delete an item by stamping deleted_at with the current timestamp.
 */
export async function softDeleteItem(itemId: string): Promise<void> {
  await query(`UPDATE items SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [itemId]);
}
