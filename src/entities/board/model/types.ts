import { Item } from "@/types";

export enum BoardType {
  CHECKLIST = 'checklist',
  NOTICE_BOARD = 'notice_board'
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
