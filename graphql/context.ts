import { NextRequest } from 'next/server';
import { auth0 } from "@/lib/auth0";

export interface GraphQLContext {
  req: NextRequest;
  user: any | null;
  dbUser?: any | null; // Optional database user info
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const session = await auth0.getSession();
  return {
    req,
    user: session?.user || null,
    dbUser: null, // You can implement fetching the database user info here if needed
  };
}