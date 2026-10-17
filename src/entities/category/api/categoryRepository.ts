import 'server-only';
import type { PoolClient } from 'pg';
import { query, queryOne, transaction } from '@/src/shared/lib/db';
import { ITEM_CATEGORIES } from '@/src/shared/config/categories';

export interface BoardCategory {
  id: string;
  board_id: string;
  name: string;
  active_item_count: number;
}

export type DeleteCategoryResult =
  | { status: 'deleted' }
  | { status: 'in_use'; itemCount: number }
  | { status: 'not_found' };

export async function getCategoriesByBoardId(boardId: string): Promise<BoardCategory[]> {
  const result = await query<BoardCategory>(
    `SELECT category.id, category.board_id, category.name,
            COUNT(item.id)::int AS active_item_count
     FROM board_categories category
     LEFT JOIN items item
       ON item.board_id = category.board_id
      AND item.category_id = category.id
      AND item.deleted_at IS NULL
     WHERE category.board_id = $1
     GROUP BY category.id
     ORDER BY category.name ASC`,
    [boardId]
  );

  return result.rows;
}

export async function createCategory(
  boardId: string,
  name: string
): Promise<BoardCategory | null> {
  return queryOne<BoardCategory>(
    `INSERT INTO board_categories (board_id, name)
     VALUES ($1, $2)
     RETURNING id, board_id, name, 0::int AS active_item_count`,
    [boardId, name.trim()]
  );
}

export async function deleteCategory(
  boardId: string,
  categoryId: string
): Promise<DeleteCategoryResult> {
  return transaction(async (client) => {
    const category = await client.query<{ id: string }>(
      `SELECT id
       FROM board_categories
       WHERE board_id = $1 AND id = $2
       FOR UPDATE`,
      [boardId, categoryId]
    );

    if (!category.rows[0]) return { status: 'not_found' };

    const countResult = await client.query<{ count: string | number }>(
      `SELECT COUNT(*)::int AS count
       FROM items
       WHERE board_id = $1
         AND category_id = $2
         AND deleted_at IS NULL`,
      [boardId, categoryId]
    );
    const itemCount = Number(countResult.rows[0]?.count ?? 0);
    if (itemCount > 0) return { status: 'in_use', itemCount };

    await client.query(
      `UPDATE items
       SET category_id = NULL
       WHERE board_id = $1
         AND category_id = $2
         AND deleted_at IS NOT NULL`,
      [boardId, categoryId]
    );
    await client.query(
      `DELETE FROM board_categories
       WHERE board_id = $1 AND id = $2`,
      [boardId, categoryId]
    );

    return { status: 'deleted' };
  });
}

export async function seedBoardCategories(
  client: PoolClient,
  boardId: string
): Promise<void> {
  await client.query(
    `INSERT INTO board_categories (board_id, name)
     SELECT $1, name
     FROM unnest($2::text[]) AS defaults(name)
     ON CONFLICT (board_id, normalized_name) DO NOTHING`,
    [boardId, [...ITEM_CATEGORIES]]
  );
}
