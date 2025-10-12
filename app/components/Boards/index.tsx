'use client';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';

const MY_BOARDS_QUERY = gql`
  query MyBoards {
    myBoards {
      id
      name
      created_at
      board_type
    }
  }
`;

interface MyBoardsData {
  myBoards: {
    id: string;
    name: string;
    type: string;
    created_at: string;
    board_type: string;
  }[];
}

export default function BoardList() {
  const { loading, error, data } = useQuery<MyBoardsData>(MY_BOARDS_QUERY);

  if (loading) return <p>Loading boards...</p>;
  if (error) return <p>Error loading boards: {error.message}</p>;

  return (
    <div className="grid gap-4">
      {data?.myBoards.length === 0 ? (
        <p>No boards yet. Create your first board!</p>
      ) : (
        data?.myBoards.map((board: any) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <h3 className="font-semibold">{board.name}</h3>
            <p className="text-sm text-gray-600">
              Type: {board.board_type.replace('_', ' ')}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}