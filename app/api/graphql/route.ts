import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext } from '@/graphql/context';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable for development
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: createContext,
});

export { handler as GET, handler as POST };