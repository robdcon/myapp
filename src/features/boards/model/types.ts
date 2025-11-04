export interface Board {
  id: string;
  name: string;
  created_at: string;
  board_type: string;
}

export interface MyBoardsData {
  myBoards: Board[];
}
