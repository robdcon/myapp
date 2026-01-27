import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getAuthUrl } from '@/lib/google-calendar';
import { pool } from '@/lib/db';

/**
 * Start Google Calendar OAuth flow
 * GET /api/auth/google/connect?boardId=123
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json({ error: 'boardId is required' }, { status: 400 });
    }

    // Verify user has edit permission for this board
    const userId = session.user.sub;
    const permissionCheck = await pool.query(
      `SELECT ub.role, ub.user_id
       FROM user_boards ub
       JOIN users u ON ub.user_id = u.id
       WHERE u.auth0_id = $1 AND ub.board_id = $2 AND ub.role IN ('owner', 'editor')`,
      [userId, boardId]
    );

    if (permissionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'You do not have permission to connect a calendar to this board' },
        { status: 403 }
      );
    }

    // Verify board is of type EVENTS
    const boardCheck = await pool.query('SELECT board_type FROM boards WHERE id = $1', [
      boardId,
    ]);

    if (boardCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    if (boardCheck.rows[0].board_type !== 'EVENTS') {
      return NextResponse.json(
        { error: 'Only Events boards can be connected to Google Calendar' },
        { status: 400 }
      );
    }

    // Generate OAuth URL with boardId in state
    const authUrl = getAuthUrl(boardId);

    // Redirect user to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error starting Google Calendar OAuth:', error);
    return NextResponse.json({ error: 'Failed to start OAuth flow' }, { status: 500 });
  }
}
