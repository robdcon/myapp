import { gql } from '@apollo/client';

export const BOARDS_ITEMS_QUERY = gql`
  query BoardItems {
    items(boardId: ID!) {
      id
      name
      details
      is_checked
    }
  }
`;
