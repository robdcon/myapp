import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

// Query the cache to get the unchecked items
const GET_UNCHECKED_ITEMS_QUERY = gql`
    query GetUncheckedItems($boardId: ID!) {
            uncheckedItems(boardId: $boardId) {
                id
                name
                details
                is_checked
                category
            }
        }
`;

export const useDisplayUncheckedItems = (boardId: string) => {
    const { data, loading, error } = useQuery(GET_UNCHECKED_ITEMS_QUERY, {
        variables: { boardId }
    });

    return {
        data,
        loading,
        error,
    }
}