// Common GraphQL types and interfaces

export enum BoardType {
  NOTICE_BOARD = 'NOTICE_BOARD',
  CHECKLIST = 'CHECKLIST',
  EVENTS = 'EVENTS',
}

export enum UserRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  picture?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  name: string;
  board_type: BoardType;
  description?: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
  items?: Item[];
}

export interface Item {
  id: string;
  board_id: string;
  name: string;
  details?: string;
  is_checked: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemRowProps {
  item: Item;
  boardType: BoardType;
  onToggleCheck: (itemId: string) => void;
  onEdit: (itemId: string) => void;
}

export interface ItemImage {
  id: string;
  item_id: string;
  image_url: string;
  image_key?: string;
  created_at: string;
}

// GraphQL Query/Mutation Response Types
export interface MyBoardsData {
  myBoards: Board[];
}

export interface GetBoardData {
  board: Board;
}

export interface CreateItemData {
  createItem: Item;
}

export interface UpdateItemData {
  updateItem: Item;
}

export interface ToggleItemCheckData {
  toggleItemCheck: Item;
}

export interface DeleteItemData {
  deleteItem: boolean;
}

export interface MutationData {
  data: {
    toggleItemCheck: Item;
    createItem: Item;
    updateItem: Item;
  };
}

// Form types
export interface ItemFormData {
  name: string;
  details: string;
  category: string;
}

export interface BoardFormData {
  name: string;
  board_type: BoardType;
  description?: string;
}

// Component Props Types
export interface BoardItemsProps {
  boardId: string;
}

export interface ItemFormProps {
  onSubmit: (item: ItemFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialValues?: Partial<ItemFormData>;
  existingCategories?: string[];
  mode?: 'create' | 'edit';
}

export interface BoardActionsProps {
  isAddingItem: boolean;
  onToggleAddItem: () => void;
  onResetChecks?: () => void;
  onCheckAll?: () => void;
  showReset?: boolean;
  showCheckAll?: boolean;
}

export interface StickyFooterProps {
  children: React.ReactNode;
}

// GraphQL Context
export interface GraphQLContext {
  req: Request;
  user: object | null;
  dbUser?: User | null;
}
