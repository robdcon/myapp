export enum PermissionLevel {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

export interface BoardShare {
  id: string;
  board_id: string;
  shared_with_user_id: string;
  shared_with_user_email?: string;
  shared_with_user_name?: string;
  shared_by_user_id: string;
  permission_level: PermissionLevel;
  created_at: string;
  updated_at: string;
}

export interface BoardWithSharing {
  id: string;
  name: string;
  board_type: string;
  description?: string;
  shares: BoardShare[];
  isShared: boolean;
  myPermission?: PermissionLevel;
  shareToken?: string;
  isPublic: boolean;
}

export interface ShareBoardInput {
  boardId: string;
  email: string;
  permission: PermissionLevel;
}

export interface UpdateBoardShareInput {
  shareId: string;
  permission: PermissionLevel;
}
