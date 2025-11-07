import { gql } from '@apollo/client';

// Queries
export const GET_BOARD_QUERY = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      name
      board_type
      description
      items {
        id
        name
        details
        is_checked
        category
      }
    }
  }
`;

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

// Mutations
export const CREATE_BOARD_MUTATION = gql`
  mutation CreateBoard($name: String!, $board_type: String!, $description: String) {
    createBoard(name: $name, board_type: $board_type, description: $description) {
      id
      name
      board_type
      description
      created_at
    }
  }
`;

export const UPDATE_BOARD_MUTATION = gql`
  mutation UpdateBoard($id: ID!, $name: String, $description: String) {
    updateBoard(id: $id, name: $name, description: $description) {
      id
      name
      description
      updated_at
    }
  }
`;

export const DELETE_BOARD_MUTATION = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`;