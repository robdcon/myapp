import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Auth0
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AUTH0_WEBHOOK_SECRET;

    if (!expectedToken) {
      console.error('❌ AUTH0_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.warn('⚠️ Unauthorized webhook attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user } = body;

    // Validate required fields
    if (!user?.user_id || !user?.email) {
      console.error('❌ Missing required user fields:', { user });
      return NextResponse.json(
        { error: 'Missing required user fields' },
        { status: 400 }
      );
    }

    console.log('📥 Registering user:', {
      auth0_id: user.user_id,
      email: user.email,
      name: user.name,
    });

    // Insert user into database
    const result = await query(
      `INSERT INTO users (auth0_id, email, name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (auth0_id) DO UPDATE
       SET email = EXCLUDED.email,
           name = EXCLUDED.name,
           picture = EXCLUDED.picture,
           updated_at = CURRENT_TIMESTAMP
       RETURNING id, auth0_id, email`,
      [user.user_id, user.email, user.name, user.picture]
    );

    console.log('✅ User registered in database:', {
      id: result.rows[0].id,
      auth0_id: result.rows[0].auth0_id,
      email: result.rows[0].email,
    });

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error('❌ Error registering user:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    return NextResponse.json(
      { error: 'Failed to register user', detail: error.message },
      { status: 500 }
    );
  }
}
