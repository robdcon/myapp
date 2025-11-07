import { Item } from "@/src/entities/item";

export enum BoardType {
  CHECKLIST = 'CHECKLIST',
  NOTICE_BOARD = 'NOTICE_BOARD'
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  board_type: BoardType;
  created_at: string;
  updated_at: string;
  items?: Item[];
}

export interface CreateBoardInput {
  name: string;
  description?: string;
  board_type: BoardType;
}

export interface UpdateBoardInput {
  id: string;
  name?: string;
  description?: string;
}

export interface BoardFormData {
  name: string;
  board_type: BoardType;
  description?: string;
}

// GraphQL Response Types
export interface GetBoardData {
  board: Board;
}

export interface MyBoardsData {
  myBoards: Board[];
}

export interface CreateBoardData {
  createBoard: Board;
}

export interface UpdateBoardData {
  updateBoard: Board;
}

export interface DeleteBoardData {
  deleteBoard: boolean;
}
