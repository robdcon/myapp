import 'server-only';
import { query, queryOne, transaction } from '@/src/shared/lib/db';
import { Board } from '../model/types';

export interface BoardRow extends Board {
  role?: string;
}

/**
 * Fetch a single board by its id.
 * Returns null if not found.
 */
export async function getBoardById(id: string): Promise<Board | null> {
  const row = await queryOne('SELECT * FROM boards WHERE id = $1', [id]);
  return row ?? null;
}

/**
 * Resolve the internal database user id for a given email address.
 * Returns null if the user does not exist.
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const result = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
    email,
  ]);
  return result.rows[0]?.id ?? null;
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

export interface CreateBoardParams {
  name: string;
  boardType: string;
  description?: string | null;
  ownerUserId: string;
}

/**
 * Create a new board and register the creating user as its OWNER.
 * Both writes happen in a single transaction so a board is never
 * created without a corresponding user_boards membership row.
 */
export async function createBoard(params: CreateBoardParams): Promise<Board> {
  const { name, boardType, description, ownerUserId } = params;

  return transaction(async (client) => {
    const boardResult = await client.query<Board>(
      `INSERT INTO boards (name, board_type, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, boardType, description ?? null]
    );

    const board = boardResult.rows[0];

    await client.query(
      `INSERT INTO user_boards (user_id, board_id, role)
       VALUES ($1, $2, 'OWNER')`,
      [ownerUserId, board.id]
    );

    return board;
  });
}

export interface UpdateBoardParams {
  id: string;
  name?: string;
  description?: string;
}

/**
 * Update editable fields on an existing board.
 * Returns the updated board, or null if no fields were supplied
 * or the board does not exist.
 */
export async function updateBoardFields(
  params: UpdateBoardParams
): Promise<Board | null> {
  const { id, name, description } = params;
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description);
  }

  if (updates.length === 0) {
    return null;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const row = await queryOne<Board>(
    `UPDATE boards
     SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );
  return row ?? null;
}

/**
 * Delete a board. Related items, memberships, and shares are removed
 * automatically via cascading foreign keys.
 */
export async function deleteBoardById(id: string): Promise<void> {
  await query('DELETE FROM boards WHERE id = $1', [id]);
}

/**
 * Fetch all boards accessible to a user (owned or shared),
 * ordered by creation date descending.
 */
export async function getBoardsByUserId(userId: string): Promise<BoardRow[]> {
  const result = await query<BoardRow>(
    `SELECT b.*, ub.role
     FROM boards b
     INNER JOIN user_boards ub ON b.id = ub.board_id
     WHERE ub.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
}
