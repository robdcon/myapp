import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    boards: [Board!]!
  }

  type Board {
    id: ID!
    name: String!
    board_type: BoardType!
    description: String
    role: String
    created_at: String!
    updated_at: String!
    items: [Item!]!
  }

  type Item {
    id: ID!
    board_id: ID!
    name: String!
    details: String
    is_checked: Boolean!
    category: String
    created_at: String!
    updated_at: String!
  }

  enum BoardType {
    NOTICE_BOARD
    CHECKLIST
  }

  type Query {
    users: [User!]!
    user(email: String!): User
    myBoards: [Board!]!
    board(id: ID!): Board
    items(boardId: ID!): [Item!]!
    item(id: ID!): Item
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    toggleItemCheck(itemId: ID!): Item!
    createItem(boardId: ID!, name: String!, details: String, category: String): Item!
    updateItem(itemId: ID!, name: String, details: String, category: String): Item!
    deleteItem(itemId: ID!): Boolean!
  }
`;