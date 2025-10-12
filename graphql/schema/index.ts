export const typeDefs = `#graphql
    type Query {
        user(email: String): User
        users: [User]
        board(board: Int!): Board
        boards(user: String!): [Int]
        item(id: String!): Item
        items(board: Int!): [Item]
        myBoards: [Board!]!
    }
    
    type Mutation {
        createUser(username: String!, email: String!) : User!
        createBoard(user: String!, name: String!, board_type: String): Int!
        shareBoard(user: String!, board: Int!): String
        createItem(board: Int!, name: String!, priority: String, checked: Boolean, category: String): Item!
        updateItem(id: Int!, name: String, priority: String, checked: Boolean, category: String): Item!
        deleteItem(id: Int!): String
        deleteBoard(id: Int!): String
        unshareBoard(user: String!, board: Int!): String
    }

    type User {
        id: String!
        username: String!
        email: String!
        boards: [String]
        sharedBoards: [String]
    }

    type Item {
        id: Int!
        name: String!
        priority: String
        checked: Boolean
        category: String
    }

    type Board {
        id: ID!
        name: String!
        board_type: BoardType!
        user_id: String
        created_at: String!
        updated_at: String!
    }

    enum BoardType {
        NOTICE_BOARD
        CHECKLIST
    }
`;