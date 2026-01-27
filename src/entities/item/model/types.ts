export interface Item {
  id: string;
  board_id: string;
  name: string;
  details?: string;
  is_checked: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
  google_event_id?: string | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  event_description?: string | null;
  google_calendar_link?: string | null;
}

export interface CreateItemInput {
  boardId: string;
  name: string;
  details?: string;
  category?: string;
}

export interface UpdateItemInput {
  itemId: string;
  name?: string;
  details?: string;
  category?: string;
}

export interface ItemFormData {
  name: string;
  details: string;
  category: string;
}

// GraphQL Response Types
export interface GetItemData {
  item: Item;
}

export interface CreateItemData {
  createItem: Item;
}

export interface UpdateItemData {
  updateItem: Item;
}

export interface ToggleItemCheckData {
  toggleItemCheck: Pick<Item, 'id' | 'is_checked'>;
}

export interface DeleteItemData {
  deleteItem: boolean;
}
