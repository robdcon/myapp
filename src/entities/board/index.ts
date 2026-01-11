export { BoardEntity } from './model/board';
export type {
  Board,
  CreateBoardInput,
  BoardFormData,
  GetBoardData,
  MyBoardsData,
  CreateBoardData,
  UpdateBoardData,
  DeleteBoardData,
} from './model/types';
export { BoardType } from './model/types';
export {
  GET_BOARD_QUERY,
  MY_BOARDS_QUERY,
  CREATE_BOARD_MUTATION,
  UPDATE_BOARD_MUTATION,
  DELETE_BOARD_MUTATION,
} from './api';
