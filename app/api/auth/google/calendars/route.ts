import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { pool } from '@/lib/db';
import { decryptToken, listCalendars, getValidAccessToken } from '@/lib/google-calendar';

/**
 * Get available Google Calendars for a board
 * GET /api/auth/google/calendars?boardId=123
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

    // Verify user has permission and board has OAuth tokens
    const userId = session.user.sub;
    const boardQuery = await pool.query(
      `SELECT b.google_access_token, b.google_refresh_token, b.google_token_expires_at
       FROM boards b
       JOIN user_boards ub ON b.id = ub.board_id
       JOIN users u ON ub.user_id = u.id
       WHERE u.auth0_id = $1 AND b.id = $2 AND ub.role IN ('owner', 'editor')`,
      [userId, boardId]
    );

    if (boardQuery.rows.length === 0) {
      return NextResponse.json(
        { error: 'Board not found or no permission' },
        { status: 404 }
      );
    }

    const board = boardQuery.rows[0];

    if (!board.google_access_token || !board.google_refresh_token) {
      return NextResponse.json(
        { error: 'Board is not connected to Google Calendar. Please connect first.' },
        { status: 400 }
      );
    }

    // Decrypt tokens
    const accessToken = decryptToken(board.google_access_token);
    const refreshToken = decryptToken(board.google_refresh_token);

    // Get valid access token (auto-refresh if needed)
    const {
      accessToken: validToken,
      wasRefreshed,
      expiresAt,
    } = await getValidAccessToken(
      accessToken,
      refreshToken,
      board.google_token_expires_at
    );

    // If token was refreshed, update database
    if (wasRefreshed) {
      const { encryptToken } = await import('@/lib/google-calendar');
      const encryptedToken = encryptToken(validToken);

      await pool.query(
        'UPDATE boards SET google_access_token = $1, google_token_expires_at = $2 WHERE id = $3',
        [encryptedToken, expiresAt, boardId]
      );
    }

    // Fetch calendars from Google
    const calendars = await listCalendars(validToken);

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}

/**
 * Select a calendar to sync with the board
 * POST /api/auth/google/calendars
 * Body: { boardId: string, calendarId: string, calendarName: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { boardId, calendarId, calendarName } = body;

    if (!boardId || !calendarId || !calendarName) {
      return NextResponse.json(
        { error: 'boardId, calendarId, and calendarName are required' },
        { status: 400 }
      );
    }

    // Verify user has permission
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
        { error: 'You do not have permission to configure this board' },
        { status: 403 }
      );
    }

    // Update board with selected calendar
    await pool.query(
      `UPDATE boards 
       SET google_calendar_id = $1,
           google_calendar_name = $2
       WHERE id = $3`,
      [calendarId, calendarName, boardId]
    );

    console.log(`✅ Calendar ${calendarName} selected for board ${boardId}`);

    return NextResponse.json({
      success: true,
      message: 'Calendar selected successfully',
    });
  } catch (error) {
    console.error('Error selecting calendar:', error);
    return NextResponse.json({ error: 'Failed to select calendar' }, { status: 500 });
  }
}
