import { NextRequest } from 'next/server';

export interface GraphQLContext {
  req: NextRequest;
  // Add user session, auth tokens, etc.
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  return {
    req,
    // You can add authentication logic here
    // user: await getUserFromToken(req.headers.get('authorization'))
  };
}