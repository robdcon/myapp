import { NextRequest } from 'next/server';
import { auth0 } from '@/src/shared/lib/auth0';
import { queryOne } from '@/src/shared/lib/db';

export interface GraphQLContext {
  req: NextRequest;
  user: any | null;
  dbUser?: any | null; // Optional database user info
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const session = await auth0.getSession();

  // TEST MODE: Allow testing with a mock user via header
  // Test mode for development - must be explicitly enabled
  const testUserId = req.headers.get('x-test-user-id');
  if (process.env.ENABLE_TEST_MODE === 'true' && testUserId) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: ENABLE_TEST_MODE cannot be active in production');
    }
    console.log('⚠️ TEST MODE: Using test user ID:', testUserId);
    return {
      req,
      user: { sub: testUserId },
      dbUser: null,
    };
  }

  const sessionUser = session?.user ?? null;
  let dbUser: any | null = null;

  if (sessionUser?.sub) {
    dbUser =
      (await queryOne('SELECT * FROM users WHERE auth0_id = $1', [sessionUser.sub])) ??
      null;
  }

  return {
    req,
    user: sessionUser,
    dbUser,
  };
}
