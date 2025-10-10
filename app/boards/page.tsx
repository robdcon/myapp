// get boards from user robdcon@gmail.com

import { gql } from '@apollo/client';
import { getClient } from '@/lib/apollo-client';
import Link from 'next/link';
import { ApolloWrapper } from '@/lib/apollo-wrapper';
import { Suspense } from 'react';

type UserQueryResult = {
  user: {
    id: string;
    email: string;
    boards: string[];
    name?: string;
    description?: string;
  };
};

export default async function BoardsPage() {
  const client = getClient();
  const { data } = await client.query<UserQueryResult>({
    query: USER_QUERY,
    // You can pass variables here if needed
  });

  return (
    <ApolloWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <h1>User Info</h1>
          {data ? (
            <>
              <p>ID: {data.user.id}</p>
              <p>Name: {data.user.name}</p>
              <p>Description: {data.user.description}</p>
            </>
          ) : (
            <p>Data is loading or unavailable.</p>
          )}
          <Link href="/">Go to Home</Link>
        </div>
      </Suspense>
    </ApolloWrapper>
  );
}

const USER_QUERY = gql`
  query User {
    user(email: "robdcon@gmail.com") {
      id
      email
      boards
    }
  }
`;
