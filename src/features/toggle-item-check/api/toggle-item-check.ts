import { useMutation, useApolloClient } from '@apollo/client/react';
import { useState } from 'react';
import { TOGGLE_ITEM_CHECK_MUTATION } from '@/src/entities/item';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { ToggleItemCheckData, Item } from '@/src/entities/item';
import type { GetBoardData } from '@/src/entities/board';

export const useToggleItemCheck = (boardId: string) => {
  const client = useApolloClient();
  const [togglingItems, setTogglingItems] = useState<Set<string>>(new Set());
  
  const [toggleCheckMutation, { loading: mutationLoading }] = useMutation<ToggleItemCheckData>(TOGGLE_ITEM_CHECK_MUTATION, {
    onError: (error) => {
      console.error('Toggle item check failed:', error.message);
      // On error, remove from toggling state
      setTogglingItems(prev => new Set());
    },
    onCompleted: (data) => {
      if (data?.toggleItemCheck?.id) {
        setTogglingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.toggleItemCheck.id);
          return newSet;
        });
      }
    },
  });

  const toggleItemCheck = (itemId: string) => {
    // Set item as toggling immediately for instant feedback
    setTogglingItems(prev => new Set(prev).add(itemId));
    
    // Get current state for optimistic response
    const existingData = client.cache.readQuery<GetBoardData>({
      query: GET_BOARD_QUERY,
      variables: { id: boardId },
    });
    
    if (!existingData?.board?.items) {
      // Remove from toggling if no data found
      setTogglingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      return;
    }
    
    const currentItem = existingData.board.items.find((item: Item) => item.id === itemId);
    if (!currentItem) {
      // Remove from toggling if item not found
      setTogglingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      return;
    }
    
    const optimisticCheckedState = !currentItem.is_checked;

    // Immediately update the cache optimistically
    const updatedItems = existingData.board.items.map((item: Item) =>
      item.id === itemId
        ? { ...item, is_checked: optimisticCheckedState }
        : item
    );

    client.cache.writeQuery({
      query: GET_BOARD_QUERY,
      variables: { id: boardId },
      data: {
        board: {
          ...existingData.board,
          items: updatedItems,
        },
      },
    });

    // Execute the mutation
    toggleCheckMutation({
      variables: { itemId },
      errorPolicy: 'all',
      update: (cache, { data }) => {
        if (!data?.toggleItemCheck) return;
        
        // Re-read the current board data to ensure we have the latest state
        const latestData = cache.readQuery<GetBoardData>({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
        });

        if (latestData?.board?.items) {
          // Update with the actual server response
          const finalItems = latestData.board.items.map((item: Item) =>
            item.id === data.toggleItemCheck.id
              ? { ...item, is_checked: data.toggleItemCheck.is_checked }
              : item
          );

          cache.writeQuery({
            query: GET_BOARD_QUERY,
            variables: { id: boardId },
            data: {
              board: {
                ...latestData.board,
                items: finalItems,
              },
            },
          });
        }
      },
    });
  };

  const isItemToggling = (itemId: string) => togglingItems.has(itemId);

  return { 
    toggleItemCheck, 
    loading: mutationLoading, 
    isItemToggling 
  };
};