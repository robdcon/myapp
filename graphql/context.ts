import { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

export interface GraphQLContext {
  req: NextRequest;
  user: any | null;
  dbUser?: any | null; // Optional database user info
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const session = await auth0.getSession();
  console.log('GraphQL Context - User Session:', session?.user);

  // TEST MODE: Allow testing with a mock user via header
  // Test mode for development - must be explicitly enabled
  const testUserId = req.headers.get('x-test-user-id');
  if (process.env.ENABLE_TEST_MODE === 'true' && testUserId) {
    console.log('⚠️ TEST MODE: Using test user ID:', testUserId);
    return {
      req,
      user: { sub: testUserId },
      dbUser: null,
    };
  }

  return {
    req,
    user: session?.user || null,
    dbUser: null, // You can implement fetching the database user info here if needed
  };
}
