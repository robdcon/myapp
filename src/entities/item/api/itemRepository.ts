import 'server-only';
import { query, queryOne, transaction } from '@/src/shared/lib/db';
import { Item } from '../model/types';

export class ItemCategoryNotFoundError extends Error {
  constructor() {
    super('The selected category is not available on this board');
    this.name = 'ItemCategoryNotFoundError';
  }
}

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
  const row = await queryOne(
    `SELECT item.*, category.name AS category
     FROM items item
     LEFT JOIN board_categories category
       ON category.board_id = item.board_id AND category.id = item.category_id
     WHERE item.id = $1`,
    [id]
  );
  return row ?? null;
}

/**
 * Fetch active items for a board ordered by category then creation date.
 */
export async function getItemsByBoardId(boardId: string): Promise<Item[]> {
  const result = await query<Item>(
    `SELECT item.*, category.name AS category
     FROM items item
     LEFT JOIN board_categories category
       ON category.board_id = item.board_id AND category.id = item.category_id
     WHERE item.board_id = $1 AND item.deleted_at IS NULL
     ORDER BY category.name NULLS LAST, item.created_at ASC`,
    [boardId]
  );
  return result.rows;
}

/**
 * Fetch unchecked, active items for a board ordered by category then creation date.
 */
export async function getUncheckedItemsByBoardId(boardId: string): Promise<Item[]> {
  const result = await query<Item>(
    `SELECT item.*, category.name AS category
     FROM items item
     LEFT JOIN board_categories category
       ON category.board_id = item.board_id AND category.id = item.category_id
     WHERE item.board_id = $1 AND item.is_checked = false AND item.deleted_at IS NULL
     ORDER BY category.name NULLS LAST, item.created_at ASC`,
    [boardId]
  );
  return result.rows;
}

/**
 * Representation of an item as returned by the Board.items field resolver.
 * event_start_time and event_end_time are epoch-millisecond strings for
 * GraphQL serialisation (converted from EXTRACT EPOCH).
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
       item.id,
       item.board_id,
       item.name,
       item.details,
       item.is_checked,
       category.name AS category,
       item.created_at,
       item.updated_at,
       item.google_event_id,
       EXTRACT(EPOCH FROM item.event_start_time)::bigint * 1000 AS event_start_time,
       EXTRACT(EPOCH FROM item.event_end_time)::bigint * 1000 AS event_end_time,
       item.event_description,
       item.google_calendar_link,
       item.deleted_at
     FROM items item
     LEFT JOIN board_categories category
       ON category.board_id = item.board_id AND category.id = item.category_id
     WHERE item.board_id = $1 AND item.deleted_at IS NULL
     ORDER BY category.name NULLS LAST, item.created_at ASC`,
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
  category?: string | null;
  createdByUserId?: string | null;
}

/**
 * Insert an item while locking its selected category against concurrent deletion.
 */
export async function createItem(params: CreateItemParams): Promise<Item | null> {
  const { boardId, name, details, category, createdByUserId } = params;
  return transaction(async (client) => {
    let categoryId: string | null = null;
    let categoryName: string | null = null;
    if (category) {
      const categoryResult = await client.query<{ id: string; name: string }>(
        `SELECT id, name
         FROM board_categories
         WHERE board_id = $1
           AND normalized_name = lower(regexp_replace($2, '^\\s+|\\s+$', '', 'g'))
         FOR KEY SHARE`,
        [boardId, category]
      );
      const selectedCategory = categoryResult.rows[0];
      if (!selectedCategory) throw new ItemCategoryNotFoundError();
      categoryId = selectedCategory.id;
      categoryName = selectedCategory.name;
    }

    const result = await client.query<Item>(
      `INSERT INTO items (board_id, name, details, category_id, created_by, is_checked)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING *`,
      [boardId, name, details, categoryId, createdByUserId]
    );
    const item = result.rows[0];
    return item ? { ...item, category: categoryName } : null;
  });
}

export interface UpdateItemParams {
  itemId: string;
  name?: string;
  details?: string;
  category?: string | null;
}

/**
 * Update editable item fields while locking a selected category against deletion.
 */
export async function updateItem(params: UpdateItemParams): Promise<Item | null> {
  const { itemId, name, details, category } = params;
  return transaction(async (client) => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;
    let categoryName: string | null | undefined;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (details !== undefined) {
      updates.push(`details = $${paramCount++}`);
      values.push(details);
    }
    if (category !== undefined) {
      let categoryId: string | null = null;
      categoryName = null;
      if (category) {
        const itemBoard = await client.query<{ board_id: string }>(
          'SELECT board_id FROM items WHERE id = $1',
          [itemId]
        );
        const boardId = itemBoard.rows[0]?.board_id;
        if (!boardId) return null;

        const categoryResult = await client.query<{ id: string; name: string }>(
          `SELECT id, name
           FROM board_categories
           WHERE board_id = $1
             AND normalized_name = lower(regexp_replace($2, '^\\s+|\\s+$', '', 'g'))
           FOR KEY SHARE`,
          [boardId, category]
        );
        const selectedCategory = categoryResult.rows[0];
        if (!selectedCategory) throw new ItemCategoryNotFoundError();
        categoryId = selectedCategory.id;
        categoryName = selectedCategory.name;
      }
      updates.push(`category_id = $${paramCount++}`);
      values.push(categoryId);
    }

    if (updates.length === 0) return null;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(itemId);
    const result = await client.query<Item>(
      `UPDATE items
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *,
         (SELECT category.name
          FROM board_categories category
          WHERE category.board_id = items.board_id
            AND category.id = items.category_id) AS category`,
      values
    );
    const item = result.rows[0];
    if (!item) return null;
    return {
      ...item,
      category: categoryName === undefined ? item.category : categoryName,
    };
  });
}

/**
 * Soft-delete an item by stamping deleted_at with the current timestamp.
 */
export async function softDeleteItem(itemId: string): Promise<void> {
  await query(`UPDATE items SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [itemId]);
}
