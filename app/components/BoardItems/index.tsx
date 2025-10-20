'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { useState } from 'react';
import StickyFooter from '@/app/components/StickyFooter';
import BoardActions from '@/app/components/BoardActions';
import ItemForm from '@/app/components/ItemForm';
import BoardItemRow from '@/app/components/BoardItemRow';
import {
  BoardItemsProps,
  GetBoardData,
  ItemFormData,
  Item,
  BoardType,
  ToggleItemCheckData
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
    optimisticResponse: (vars) => {
      const item = board?.items?.find((i: Item) => i.id === vars.itemId);
      return {
        toggleItemCheck: {
          __typename: 'Item',
          id: vars.itemId,
          is_checked: !item?.is_checked,
        },
      };
    },
    update: (cache, result) => {
      const mutationData = result.data as ToggleItemCheckData | undefined;
      if (!mutationData?.toggleItemCheck) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: existingData.board.items?.map((item: Item) =>
                item.id === mutationData.toggleItemCheck.id
                  ? { ...item, is_checked: mutationData.toggleItemCheck.is_checked }
                  : item
              ),
            },
          },
        });
      }
    },
  });

  const [createItem, { loading: creating }] = useMutation(CREATE_ITEM, {
    optimisticResponse: (vars) => ({
      createItem: {
        __typename: 'Item',
        id: `temp-${Date.now()}`, // Temporary ID
        name: vars.name,
        details: vars.details || '',
        is_checked: false,
        category: vars.category || '',
      },
    }),
    update: (cache, result) => {
      const mutationData = result.data as { createItem: Item } | undefined;
      if (!mutationData?.createItem) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: [...(existingData.board.items || []), mutationData.createItem],
            },
          },
        });
      }
    },
    onCompleted: () => {
      setIsAddingItem(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    optimisticResponse: (vars) => {
      const item = board?.items?.find((i: Item) => i.id === vars.itemId);
      return {
        updateItem: {
          __typename: 'Item',
          id: vars.itemId,
          name: vars.name || item?.name || '',
          details: vars.details || item?.details || '',
          is_checked: item?.is_checked || false,
          category: vars.category || item?.category || '',
        },
      };
    },
    update: (cache, result) => {
      const mutationData = result.data as { updateItem: Item } | undefined;
      if (!mutationData?.updateItem) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: existingData.board.items?.map((item: Item) =>
                item.id === mutationData.updateItem.id
                  ? { ...item, ...mutationData.updateItem }
                  : item
              ),
            },
          },
        });
      }
    },
    onCompleted: () => {
      setEditingItemId(null);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleCreateItem = (item: ItemFormData) => {
    createItem({
      variables: {
        boardId,
        name: item.name.trim(),
        details: item.details.trim() || null,
        category: item.category.trim() || null,
      },
    });
  };

  const handleUpdateItem = (item: ItemFormData) => {
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

  const handleToggleCheck = (itemId: string) => {
    toggleCheck({ variables: { itemId } });
  };

  const handleResetChecks = () => {
    board?.items
      ?.filter((i: Item) => i.is_checked)
      .forEach((i: Item) => handleToggleCheck(i.id));
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
  const itemsByCategory = board?.items?.reduce((acc: any, item: Item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get unique categories
  const categories = board?.items?.map((item: Item) => item.category).filter(Boolean);
  // remove duplicates without using new Set

  const uniqueCategories = [...new Set(categories)].sort();

  const editingItem = editingItemId
    ? board?.items?.find((i: Item) => i.id === editingItemId)
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
        {/* Board Intro */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{board?.name}</h1>

            {board?.description && (
              <p className="text-lg text-gray-600">{board.description}</p>
            )}

            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {board?.board_type === BoardType.CHECKLIST ? '✓ Checklist' : '📋 Notice Board'}
              </span>

              {board?.board_type === BoardType.CHECKLIST && (board?.items ?? []).length > 0 && (
                <span className="text-sm text-gray-600">
                  {(board.items ?? []).filter((i: Item) => i.is_checked).length} / {(board.items ?? []).length} completed
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
            existingCategories={uniqueCategories.filter((category): category is string => category !== undefined)}
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
            existingCategories={uniqueCategories.filter((category): category is string => category !== undefined)}
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
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {isAddingItem ? 'Close Form' : 'Add Item'}
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item: Item) => (
                  <BoardItemRow
                    key={item.id}
                    item={item}
                    boardType={board?.board_type ?? BoardType.CHECKLIST}
                    onToggleCheck={handleToggleCheck}
                    onEdit={setEditingItemId}
                  />
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
          showReset={board?.board_type === BoardType.CHECKLIST && board?.items?.some((i: Item) => i.is_checked)}
        />
      </StickyFooter>
    </div>
  );
}
