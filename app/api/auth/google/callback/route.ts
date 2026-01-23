import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { exchangeCodeForTokens, encryptToken } from '@/lib/google-calendar';
import { pool } from '@/lib/db';

/**
 * Handle Google Calendar OAuth callback
 * GET /api/auth/google/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors (user denied permission, etc.)
    if (error) {
      console.error('OAuth error:', error);
      const errorUrl = new URL('/', request.url);
      errorUrl.searchParams.set('calendar_error', error);
      return NextResponse.redirect(errorUrl);
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/?calendar_error=missing_params', request.url)
      );
    }

    // Decode state to get boardId
    let boardId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      boardId = decoded.boardId;
    } catch (err) {
      console.error('Failed to decode state:', err);
      return NextResponse.redirect(
        new URL('/?calendar_error=invalid_state', request.url)
      );
    }

    // Verify user still has permission for this board
    const userId = session.user.sub;
    const permissionCheck = await pool.query(
      `SELECT ub.user_id, u.id as db_user_id
       FROM user_boards ub
       JOIN users u ON ub.user_id = u.id
       WHERE u.auth0_id = $1 AND ub.board_id = $2 AND ub.role IN ('owner', 'editor')`,
      [userId, boardId]
    );

    if (permissionCheck.rows.length === 0) {
      return NextResponse.redirect(
        new URL('/?calendar_error=permission_denied', request.url)
      );
    }

    const dbUserId = permissionCheck.rows[0].db_user_id;

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokens.accessToken);
    const encryptedRefreshToken = encryptToken(tokens.refreshToken);

    // Store tokens in database (but don't set calendar_id yet - user selects that next)
    await pool.query(
      `UPDATE boards 
       SET google_access_token = $1,
           google_refresh_token = $2,
           google_token_expires_at = $3,
           calendar_connected_by = $4
       WHERE id = $5`,
      [encryptedAccessToken, encryptedRefreshToken, tokens.expiresAt, dbUserId, boardId]
    );

    console.log(`✅ Calendar OAuth completed for board ${boardId}`);

    // Redirect back to board with success message
    const successUrl = new URL(`/boards/${boardId}`, request.url);
    successUrl.searchParams.set('calendar_connected', 'true');
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Error handling Google Calendar callback:', error);
    return NextResponse.redirect(
      new URL('/?calendar_error=callback_failed', request.url)
    );
  }
}
