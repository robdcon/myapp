import { useQuery } from '@apollo/client/react';
import { GET_BOARD_QUERY } from '@/src/entities/board';
import type { GetBoardData } from '@/src/entities/board';
import type { Item } from '@/src/entities/item';
import { useMemo } from 'react';

export const useDisplayUncheckedItems = (boardId: string) => {
    // Use cache-only policy to only read from cache and watch for changes
    const { data, loading, error } = useQuery<GetBoardData>(GET_BOARD_QUERY, {
        variables: { id: boardId },
        fetchPolicy: 'cache-only', // Only read from cache, don't make network request
        nextFetchPolicy: 'cache-only', // Keep using cache-only on refetch
    });

    // Memoize the filtered unchecked items
    const uncheckedItems = useMemo(() => {
        return data?.board?.items?.filter((item: Item) => !item.is_checked) || [];
    }, [data?.board?.items]);

    console.log('Unchecked items from cache (reactive):', uncheckedItems);

    return {
        uncheckedItems,
        totalUnchecked: uncheckedItems.length,
        hasUncheckedItems: uncheckedItems.length > 0,
        loading,
        error
    };
}