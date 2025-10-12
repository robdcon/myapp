import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Auth0 (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AUTH0_WEBHOOK_SECRET;
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user } = body;

    // Insert user into database
    await query(
      `INSERT INTO users (auth0_id, email, name, picture)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (auth0_id) DO NOTHING`,
      [user.user_id, user.email, user.name, user.picture]
    );

    console.log('✅ User registered in database:', user.email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}