'use client';

import { useMutation } from '@apollo/client/react';
import { DELETE_ITEM_MUTATION } from '@/src/entities/item/api';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { DeleteItemData } from '@/src/entities/item';

interface UseDeleteItemOptions {
  boardId: string;
}

export function useDeleteItem({ boardId }: UseDeleteItemOptions) {
  const [deleteItemMutation, { loading }] = useMutation<DeleteItemData>(
    DELETE_ITEM_MUTATION,
    {
      refetchQueries: [
        {
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
        },
      ],
    }
  );

  const deleteItem = async (itemId: string) => {
    try {
      await deleteItemMutation({
        variables: { itemId },
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  return {
    deleteItem,
    isDeleting: loading,
  };
}
