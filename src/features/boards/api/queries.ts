import { gql } from '@apollo/client';

export const MY_BOARDS_QUERY = gql`
  query MyBoards {
    myBoards {
      id
      name
      created_at
      board_type
    }
  }
`;
