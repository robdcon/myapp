'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useState } from 'react';
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

const CREATE_ITEM = gql`
  mutation CreateItem($boardId: ID!, $name: String!, $details: String, $category: String) {
    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {
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
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', details: '', category: '' });

  const { loading, error, data } = useQuery<BoardData>(GET_BOARD_QUERY, {
    variables: { id: boardId },
  });

  const [toggleCheck] = useMutation(TOGGLE_ITEM_CHECK);

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    refetchQueries: [{ query: GET_BOARD_QUERY, variables: { id: boardId } }],
    onCompleted: () => {
      setNewItem({ name: '', details: '', category: '' });
      setIsAddingItem(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    createItem({
      variables: {
        boardId,
        name: newItem.name.trim(),
        details: newItem.details.trim() || null,
        category: newItem.category.trim() || null,
      },
    });
  };

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

  // Get unique categories for the dropdown
  const categories = board?.items?.map((item: any) => item.category).filter(Boolean);
  const uniqueCategories = [...new Set(categories)].sort((a, b) => a.localeCompare(b));

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
                      refetchQueries: [{ query: GET_ITEM_QUERY, variables: { id: item.id } }],
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
      <button
        onClick={() => setIsAddingItem(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        + Add Item
      </button>
      {isAddingItem && (
        <div className="mb-6 p-6 bg-white border-2 border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Strawberries"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details (optional)
              </label>
              <input
                type="text"
                value={newItem.details}
                onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                placeholder="e.g., 2 packs"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (optional)
              </label>
              <input
                type="text"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="e.g., Fruit"
                list="categories"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <datalist id="categories">
                {uniqueCategories.map((cat: string) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !newItem.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
              >
                {creating ? 'Adding...' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItem({ name: '', details: '', category: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
