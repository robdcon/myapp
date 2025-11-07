import { useMutation, useApolloClient } from '@apollo/client/react';
import { TOGGLE_ITEM_CHECK_MUTATION } from '@/src/entities/item';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { ToggleItemCheckData, Item } from '@/src/entities/item';
import type { GetBoardData } from '@/src/entities/board';

export const useToggleItemCheck = (boardId: string) => {
  const client = useApolloClient();
  const [toggleCheckMutation, { loading }] = useMutation<ToggleItemCheckData>(TOGGLE_ITEM_CHECK_MUTATION, {
    onError: (error) => {
      console.error('Toggle item check failed:', error.message);
    },
  });

  const toggleItemCheck = (itemId: string) => {
    // Get current state for optimistic response
    const existingData = client.cache.readQuery<GetBoardData>({
      query: GET_BOARD_QUERY,
      variables: { id: boardId },
    });
    const currentItem = existingData?.board?.items?.find((item: Item) => item.id === itemId);
    const optimisticCheckedState = currentItem ? !currentItem.is_checked : true;

    toggleCheckMutation({
      variables: { itemId },
      optimisticResponse: {
        toggleItemCheck: {
          id: itemId,
          is_checked: optimisticCheckedState,
          __typename: 'Item' as const,
        },
      } as any, // Type assertion to allow __typename
      update: (cache, { data }) => {
        if (!data?.toggleItemCheck) return;
        // Use cache.modify to update only the toggled item's is_checked field
        cache.modify({
          id: cache.identify({ __typename: 'Item', id: data.toggleItemCheck.id }),
          fields: {
            is_checked() {
              return data.toggleItemCheck.is_checked;
            },
          },
        });
      },
    });
  };

  return { toggleItemCheck, loading };
};