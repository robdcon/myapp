import { gql } from '@apollo/client';

// Queries
export const GET_ITEM_QUERY = gql`
  query GetItem($id: ID!) {
    item(id: $id) {
      id
      name
      details
      is_checked
      category
      board_id
      created_at
      updated_at
    }
  }
`;

// Mutations
export const CREATE_ITEM_MUTATION = gql`
  mutation CreateItem(
    $boardId: ID!
    $name: String!
    $details: String
    $category: String
  ) {
    createItem(boardId: $boardId, name: $name, details: $details, category: $category) {
      id
      name
      details
      is_checked
      category
    }
  }
`;

export const UPDATE_ITEM_MUTATION = gql`
  mutation UpdateItem($itemId: ID!, $name: String, $details: String, $category: String) {
    updateItem(itemId: $itemId, name: $name, details: $details, category: $category) {
      id
      name
      details
      is_checked
      category
    }
  }
`;

export const TOGGLE_ITEM_CHECK_MUTATION = gql`
  mutation ToggleItemCheck($itemId: ID!) {
    toggleItemCheck(itemId: $itemId) {
      id
      is_checked
    }
  }
`;

export const DELETE_ITEM_MUTATION = gql`
  mutation DeleteItem($itemId: ID!) {
    deleteItem(itemId: $itemId)
  }
`;
