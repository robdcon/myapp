import { useMutation } from '@apollo/client/react';
import { CREATE_ITEM_MUTATION } from '@/src/entities/item';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { CreateItemInput, CreateItemData } from '@/src/entities/item';
import type { GetBoardData } from '@/src/entities/board';

export const useCreateItem = (boardId: string, onSuccess?: () => void) => {
  const [createItemMutation, { loading }] = useMutation<CreateItemData>(CREATE_ITEM_MUTATION, {
    optimisticResponse: (vars) => ({
      createItem: {
        __typename: 'Item',
        id: `temp-${Date.now()}-${Math.random()}`, // Better unique temporary ID
        name: vars.name,
        details: vars.details || '',
        is_checked: false,
        category: vars.category || '',
        board_id: boardId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }),
    update: (cache, result) => {
      const mutationData = result.data;
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
      onSuccess?.();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const createItem = (input: Omit<CreateItemInput, 'boardId'>) => {
    createItemMutation({
      variables: {
        boardId,
        name: input.name.trim(),
        details: input.details?.trim() || null,
        category: input.category?.trim() || null,
      },
    });
  };

  return { createItem, loading };
};
