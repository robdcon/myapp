export interface ItemSummary {
  id: string;
  name: string;
}

export interface DisplayListSummaryProps {
  totalItems: number;
  checkedItems: number;
  uncheckedItems: number;
  itemList: ItemSummary[];
}
