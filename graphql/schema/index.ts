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
    shares: [BoardShare!]!
    isShared: Boolean!
    myPermission: PermissionLevel
    shareToken: String
    isPublic: Boolean!
  }

  type BoardShare {
    id: ID!
    board_id: ID!
    board: Board!
    shared_with_user_id: String!
    shared_with_user_email: String
    shared_with_user_name: String
    shared_by_user_id: String!
    permission_level: PermissionLevel!
    created_at: String!
    updated_at: String!
  }

  enum PermissionLevel {
    VIEW
    EDIT
    ADMIN
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
    sharedBoards: [Board!]!
    board(id: ID!): Board
    boardShares(boardId: ID!): [BoardShare!]!
    items(boardId: ID!): [Item!]!
    item(id: ID!): Item
    uncheckedItems(boardId: ID!): [Item!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    toggleItemCheck(itemId: ID!): Item!
    createItem(boardId: ID!, name: String!, details: String, category: String): Item!
    updateItem(itemId: ID!, name: String, details: String, category: String): Item!
    deleteItem(itemId: ID!): Boolean!

    # Board Sharing Mutations
    shareBoard(boardId: ID!, email: String!, permission: PermissionLevel!): BoardShare!
    updateBoardShare(shareId: ID!, permission: PermissionLevel!): BoardShare!
    removeBoardShare(shareId: ID!): Boolean!
    generateShareLink(boardId: ID!): String!
    revokeShareLink(boardId: ID!): Boolean!
  }
`;
