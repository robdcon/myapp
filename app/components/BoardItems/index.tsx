'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

import Link from 'next/link';
import { useState } from 'react';
import StickyFooter from '@/app/components/StickyFooter';
import BoardActions from '@/app/components/BoardActions';
import ItemForm from '@/app/components/ItemForm';
import { 
  BoardItemsProps, 
  GetBoardData, 
  ItemFormData,
  Item 
} from '@/types';

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

const UPDATE_ITEM = gql`
  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {
    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {
      id
      name
      details
      is_checked
      category
    }
  }
`;

export default function BoardItems({ boardId }: BoardItemsProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const { loading, error, data } = useQuery<GetBoardData>(GET_BOARD_QUERY, {
    variables: { id: boardId },
  });

  const [toggleCheck] = useMutation(TOGGLE_ITEM_CHECK, {
    refetchQueries: [{ query: GET_BOARD_QUERY, variables: { id: boardId } }],
  });

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    refetchQueries: [{ query: GET_BOARD_QUERY, variables: { id: boardId } }],
    onCompleted: () => {
      setIsAddingItem(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    refetchQueries: [{ query: GET_BOARD_QUERY, variables: { id: boardId } }],
    onCompleted: () => {
      setEditingItemId(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleCreateItem = (item: { name: string; details: string; category: string }) => {
    createItem({
      variables: {
        boardId,
        name: item.name.trim(),
        details: item.details.trim() || null,
        category: item.category.trim() || null,
      },
    });
  };

  const handleUpdateItem = (item: { name: string; details: string; category: string }) => {
    if (!editingItemId) return;
    
    updateItem({
      variables: {
        itemId: editingItemId,
        name: item.name.trim(),
        details: item.details.trim() || null,
        category: item.category.trim() || null,
      },
    });
  };

  const handleResetChecks = () => {
    (board?.items ?? [])
      .filter((i: any) => i.is_checked)
      .forEach((i: any) => toggleCheck({ variables: { itemId: i.id } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  const board = data?.board;
  
  // Group items by category
  const itemsByCategory = board?.items?.reduce((acc: any, item: any) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get unique categories
  const categories = board?.items?.map((item: any) => item.category).filter(Boolean);
  const uniqueCategories = [...new Set(categories)].sort();

  const editingItem = editingItemId 
    ? board?.items?.find((i: any) => i.id === editingItemId) 
    : null;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to boards
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{board?.name}</h1>
            
            {board?.description && (
              <p className="text-lg text-gray-600">{board.description}</p>
            )}
            
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {board?.board_type === 'CHECKLIST' ? '✓ Checklist' : '📋 Notice Board'}
              </span>
              
              {board?.board_type === 'CHECKLIST' && (board?.items?.length ?? 0) > 0 && (
                <span className="text-sm text-gray-600">
                  {(board?.items?.filter((i: any) => i.is_checked).length ?? 0)} / {(board?.items?.length ?? 0)} completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {isAddingItem && (
        <div className="mb-6">
          <ItemForm
            onSubmit={handleCreateItem}
            onCancel={() => setIsAddingItem(false)}
            isLoading={creating}
            existingCategories={uniqueCategories}
            mode="create"
          />
        </div>
      )}

      {/* Edit Item Form */}
      {editingItemId && editingItem && (
        <div className="mb-6">
          <ItemForm
            onSubmit={handleUpdateItem}
            onCancel={() => setEditingItemId(null)}
            isLoading={updating}
            initialValues={{
              name: editingItem.name,
              details: editingItem.details || '',
              category: editingItem.category || '',
            }}
            existingCategories={uniqueCategories}
            mode="edit"
          />
        </div>
      )}

      {/* Items by Category */}
      {!itemsByCategory || Object.entries(itemsByCategory).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No items yet. Start adding items to your board!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([category, items]: [string, any]) => (
            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <label className="flex items-start gap-4 flex-1 cursor-pointer">
                      {board?.board_type === 'CHECKLIST' && (
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={item.is_checked}
                            onChange={() => toggleCheck({ variables: { itemId: item.id } })}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-medium ${
                          item.is_checked 
                            ? 'line-through text-gray-400' 
                            : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h3>
                        
                        {item.details && (
                          <p className={`mt-1 text-sm ${
                            item.is_checked 
                              ? 'text-gray-400' 
                              : 'text-gray-600'
                          }`}>
                            {item.details}
                          </p>
                        )}
                      </div>
                    </label>

                    <button
                      onClick={() => setEditingItemId(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Footer */}
      <StickyFooter>
        <BoardActions
          isAddingItem={isAddingItem}
          onToggleAddItem={() => setIsAddingItem(!isAddingItem)}
          onResetChecks={handleResetChecks}
          showReset={board?.board_type === 'CHECKLIST' && board?.items?.some((i: any) => i.is_checked)}
        />
      </StickyFooter>
    </div>
  );
}
