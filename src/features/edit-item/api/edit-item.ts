import { useMutation } from '@apollo/client/react';
import { UPDATE_ITEM_MUTATION } from '@/src/entities/item';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { UpdateItemInput, UpdateItemData, Item } from '@/src/entities/item';
import type { GetBoardData } from '@/src/entities/board';

export const useEditItem = (boardId: string, onSuccess?: () => void) => {
  const [updateItemMutation, { loading }] = useMutation<UpdateItemData>(
    UPDATE_ITEM_MUTATION,
    {
      optimisticResponse: (vars) => {
        return {
          updateItem: {
            __typename: 'Item',
            id: vars.itemId,
            name: vars.name || '',
            details: vars.details || '',
            is_checked: false, // This will be preserved by the update function
            category: vars.category || '',
            board_id: boardId,
            created_at: '',
            updated_at: new Date().toISOString(),
          },
        };
      },
      update: (cache, result, { variables }) => {
        const mutationData = result.data;
        if (!mutationData?.updateItem || !variables) return;

        const existingData = cache.readQuery<GetBoardData>({
          query: GET_BOARD_QUERY,
          variables: { id: boardId },
        });

        if (existingData?.board) {
          const currentItem = existingData.board.items?.find(
            (item: Item) => item.id === variables.itemId
          );

          cache.writeQuery({
            query: GET_BOARD_QUERY,
            variables: { id: boardId },
            data: {
              board: {
                ...existingData.board,
                items: existingData.board.items?.map((item: Item) =>
                  item.id === mutationData.updateItem.id
                    ? {
                        ...item,
                        ...mutationData.updateItem,
                        is_checked: currentItem?.is_checked || false,
                      }
                    : item
                ),
              },
            },
          });
        }
      },
      onCompleted: () => {
        onSuccess?.();
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  const editItem = (input: UpdateItemInput) => {
    updateItemMutation({
      variables: {
        itemId: input.itemId,
        name: input.name?.trim() || null,
        details: input.details?.trim() || null,
        category: input.category?.trim() || null,
      },
    });
  };

  return { editItem, loading };
};
