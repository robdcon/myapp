'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client'

const GET_BOARD_QUERY = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      name
      board_type
      description
      items {
        id
        name
        details
        is_checked
        category
      }
    }
  }
`;

const TOGGLE_ITEM_CHECK = gql`
  mutation ToggleItemCheck($itemId: ID!) {
    toggleItemCheck(itemId: $itemId) {
      id
      is_checked
    }
  }
`;

const GET_ITEM_QUERY = gql`
  query GetItem($id: ID!) {
    item(id: $id) {
      id
      name
      details
      is_checked
      category
    }
  }
`;

interface BoardItemsProps {
  boardId: string;
}

interface BoardData {
  board: {
    id: string;
    name: string;
    board_type: string;
    description?: string;
    items: Array<{
      id: string;
      name: string;
      details?: string;
      is_checked: boolean;
      category?: string;
    }>;
  };
}

export default function BoardItems({ boardId }: BoardItemsProps) {
  const { loading, error, data } = useQuery<BoardData>(GET_BOARD_QUERY, {
    variables: { id: boardId },
  });

  const [toggleCheck] = useMutation(TOGGLE_ITEM_CHECK);

  if (loading) return <p>Loading board...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const board = data?.board;
  
  // Group items by category
  const itemsByCategory = board?.items.reduce((acc: any, item: any) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{board?.name}</h1>
      {board?.description && (
        <p className="text-gray-600 mb-6">{board.description}</p>
      )}

      {Object.entries(itemsByCategory || {}).map(([category, items]: [string, any]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{category}</h2>
          <div className="space-y-2">
            {items.map((item: any) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-4 bg-white border rounded-lg hover:shadow-sm transition cursor-pointer"
              >
                {board?.board_type === 'CHECKLIST' && (
                  <input
                    type="checkbox"
                    checked={item.is_checked}
                    onChange={() => toggleCheck({ 
                      variables: { itemId: item.id }, 
                      refetchQueries: [{ query: GET_ITEM_QUERY, variables: { id: item.id } }] ,
                      optimisticResponse: {
                        toggleItemCheck: {
                          id: item.id,
                          is_checked: !item.is_checked,
                          __typename: 'Item'
                        }
                      }
                    })}
                    className="mt-1 w-5 h-5 cursor-pointer"
                  />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium ${item.is_checked ? 'line-through text-gray-400' : ''}`}>
                    {item.name}
                  </h3>
                  {item.details && (
                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}