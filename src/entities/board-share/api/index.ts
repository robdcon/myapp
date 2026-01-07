import { gql } from '@apollo/client';

// Queries
export const GET_BOARD_SHARES_QUERY = gql`
  query GetBoardShares($boardId: ID!) {
    boardShares(boardId: $boardId) {
      id
      board_id
      shared_with_user_id
      shared_with_user_email
      shared_with_user_name
      shared_by_user_id
      permission_level
      created_at
      updated_at
    }
  }
`;

export const GET_SHARED_BOARDS_QUERY = gql`
  query GetSharedBoards {
    sharedBoards {
      id
      name
      board_type
      description
      created_at
      myPermission
      isShared
    }
  }
`;

// Mutations
export const SHARE_BOARD_MUTATION = gql`
  mutation ShareBoard($boardId: ID!, $email: String!, $permission: PermissionLevel!) {
    shareBoard(boardId: $boardId, email: $email, permission: $permission) {
      id
      board_id
      shared_with_user_id
      shared_with_user_email
      shared_with_user_name
      permission_level
      created_at
    }
  }
`;

export const UPDATE_BOARD_SHARE_MUTATION = gql`
  mutation UpdateBoardShare($shareId: ID!, $permission: PermissionLevel!) {
    updateBoardShare(shareId: $shareId, permission: $permission) {
      id
      permission_level
      updated_at
    }
  }
`;

export const REMOVE_BOARD_SHARE_MUTATION = gql`
  mutation RemoveBoardShare($shareId: ID!) {
    removeBoardShare(shareId: $shareId)
  }
`;

export const GENERATE_SHARE_LINK_MUTATION = gql`
  mutation GenerateShareLink($boardId: ID!) {
    generateShareLink(boardId: $boardId)
  }
`;

export const REVOKE_SHARE_LINK_MUTATION = gql`
  mutation RevokeShareLink($boardId: ID!) {
    revokeShareLink(boardId: $boardId)
  }
`;
