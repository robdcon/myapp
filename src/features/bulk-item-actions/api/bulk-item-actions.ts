import { useToggleItemCheck } from '@/src/features/toggle-item-check';
import type { Item } from '@/src/entities/item';

export const useBulkItemActions = (boardId: string, items: Item[]) => {
  const { toggleItemCheck } = useToggleItemCheck(boardId);

  const checkAllItems = () => {
    if (!globalThis.confirm('Are you sure you want to check all items?')) {
      return;
    }
    
    const uncheckedItems = items.filter(item => !item.is_checked);
    for (const item of uncheckedItems) {
      toggleItemCheck(item.id);
    }
  };

  const uncheckAllItems = () => {
    if (!globalThis.confirm('Are you sure you want to uncheck all items?')) {
      return;
    }
    
    const checkedItems = items.filter(item => item.is_checked);
    for (const item of checkedItems) {
      toggleItemCheck(item.id);
    }
  };

  const hasCheckedItems = items.some(item => item.is_checked);
  const hasUncheckedItems = items.some(item => !item.is_checked);

  return {
    checkAllItems,
    uncheckAllItems,
    hasCheckedItems,
    hasUncheckedItems,
  };
};