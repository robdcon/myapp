import { useMutation } from '@apollo/client/react';
import { TOGGLE_ITEM_CHECK_MUTATION } from '@/src/entities/item';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { ToggleItemCheckData, Item } from '@/src/entities/item';
import type { GetBoardData } from '@/src/entities/board';

export const useToggleItemCheck = (boardId: string) => {
  const [toggleCheckMutation] = useMutation<ToggleItemCheckData>(TOGGLE_ITEM_CHECK_MUTATION, {
    optimisticResponse: (vars) => {
      return {
        toggleItemCheck: {
          __typename: 'Item',
          id: vars.itemId,
          is_checked: true, // This will be corrected by the update function
        },
      };
    },
    update: (cache, result, { variables }) => {
      const mutationData = result.data;
      if (!mutationData?.toggleItemCheck || !variables) return;

      const existingData = cache.readQuery<GetBoardData>({
        query: GET_BOARD_QUERY,
        variables: { id: boardId },
      });

      if (existingData?.board) {
        // Find the current item to determine its current state for optimistic response
        const currentItem = existingData.board.items?.find((item: Item) => item.id === variables.itemId);
        
        cache.writeQuery({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
          data: {
            board: {
              ...existingData.board,
              items: existingData.board.items?.map((item: Item) =>
                item.id === mutationData.toggleItemCheck.id
                  ? { ...item, is_checked: currentItem ? !currentItem.is_checked : mutationData.toggleItemCheck.is_checked }
                  : item
              ),
            },
          },
        });
      }
    },
  });

  const toggleItemCheck = (itemId: string) => {
    toggleCheckMutation({ variables: { itemId } });
  };

  return { toggleItemCheck };
};