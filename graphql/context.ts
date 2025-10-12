import { NextRequest } from 'next/server';
import { auth0 } from "@/lib/auth0";

export interface GraphQLContext {
  req: NextRequest;
  user: any | null;
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const session = await auth0.getSession();
  console.log('🔐 Auth0 session user:', session?.user);
  return {
    req,
    user: session?.user || null,
  };
}