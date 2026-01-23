import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { pool } from '@/lib/db';
import { syncBoardCalendar, getBoardSyncStatus } from '@/lib/calendar-sync';

/**
 * Get calendar sync status for a board
 * GET /api/calendar/sync?boardId=123
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

    // Verify user has access to this board
    const userId = session.user.sub;
    const permissionCheck = await pool.query(
      `SELECT ub.role
       FROM user_boards ub
       JOIN users u ON ub.user_id = u.id
       WHERE u.auth0_id = $1 AND ub.board_id = $2`,
      [userId, boardId]
    );

    if (permissionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Board not found or no permission' },
        { status: 404 }
      );
    }

    // Get sync status
    const status = await getBoardSyncStatus(boardId);

    if (!status) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}

/**
 * Trigger calendar sync for a board
 * POST /api/calendar/sync
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
        { error: 'You do not have permission to sync this board' },
        { status: 403 }
      );
    }

    // Trigger sync
    console.log(`🔄 Starting calendar sync for board ${boardId}...`);
    const result = await syncBoardCalendar(boardId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Sync failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Calendar synced successfully',
      stats: {
        itemsCreated: result.itemsCreated,
        itemsUpdated: result.itemsUpdated,
        itemsDeleted: result.itemsDeleted,
      },
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}
