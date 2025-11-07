export interface BulkItemActionsProps {
  hasCheckedItems: boolean;
  hasUncheckedItems: boolean;
  onCheckAll: () => void;
  onUncheckAll: () => void;
}