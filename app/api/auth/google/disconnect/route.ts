import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { pool } from '@/lib/db';

/**
 * Disconnect Google Calendar from a board
 * POST /api/auth/google/disconnect
 * Body: { boardId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { boardId } = body;

    if (!boardId) {
      return NextResponse.json({ error: 'boardId is required' }, { status: 400 });
    }

    // Verify user has edit permission for this board
    const userId = session.user.sub;
    const permissionCheck = await pool.query(
      `SELECT ub.role
       FROM user_boards ub
       JOIN users u ON ub.user_id = u.id
       WHERE u.auth0_id = $1 AND ub.board_id = $2 AND ub.role IN ('owner', 'editor')`,
      [userId, boardId]
    );

    if (permissionCheck.rows.length === 0) {
      return NextResponse.json(
        {
          error: 'You do not have permission to disconnect the calendar from this board',
        },
        { status: 403 }
      );
    }

    // Clear calendar connection (but keep the board and items)
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

    // Optionally: Delete all calendar-synced items from the board
    // This is commented out - you may want to keep historical events
    // await pool.query(
    //   'DELETE FROM items WHERE board_id = $1 AND google_event_id IS NOT NULL',
    //   [boardId]
    // );

    console.log(`✅ Calendar disconnected from board ${boardId}`);

    return NextResponse.json({
      success: true,
      message: 'Calendar disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 });
  }
}
