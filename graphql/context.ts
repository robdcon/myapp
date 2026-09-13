import { NextRequest } from 'next/server';
import { auth0 } from '@/src/shared/lib/auth0';
import { queryOne } from '@/src/shared/lib/db';

/**
 * Fallback registration path.
 *
 * The primary registration path is an Auth0 Action webhook that POSTs to
 * /api/auth/register-user on a user's first login. That webhook can silently
 * fail to fire (e.g. it can't reach a localhost dev server, or the Action
 * isn't deployed/attached). As defense-in-depth, upsert the authenticated
 * user here so any authenticated GraphQL request guarantees a matching
 * `users` row, regardless of whether the webhook ever ran.
 */
async function upsertUserFromSession(sessionUser: {
  sub: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}) {
  return queryOne(
    `INSERT INTO users (auth0_id, email, name, picture)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (auth0_id) DO UPDATE
       SET email = EXCLUDED.email,
           name = EXCLUDED.name,
           picture = EXCLUDED.picture,
           updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      sessionUser.sub,
      sessionUser.email ?? null,
      sessionUser.name ?? null,
      sessionUser.picture ?? null,
    ]
  );
}

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

    // Defense-in-depth: if the Auth0 registration webhook hasn't created this
    // user yet (e.g. it can't reach a local dev server, or fired before this
    // schema existed), create/refresh the row here so authenticated requests
    // still work. Requires an email, matching the webhook's own validation.
    if (!dbUser && sessionUser.email) {
      try {
        dbUser = await upsertUserFromSession({
          sub: sessionUser.sub,
          email: sessionUser.email,
          name: sessionUser.name,
          picture: sessionUser.picture,
        });
      } catch (error) {
        console.error('❌ Fallback user upsert failed:', error);
      }
    }
  }

  return {
    req,
    user: sessionUser,
    dbUser,
  };
}
