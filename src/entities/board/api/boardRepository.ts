import 'server-only';
import { query, queryOne } from '@/src/shared/lib/db';
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
