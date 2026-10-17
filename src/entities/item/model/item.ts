export class ItemEntity {
  static readonly UNCATEGORIZED_CATEGORY_KEY = '\u0000';
  static readonly UNCATEGORIZED_CATEGORY_LABEL = 'Uncategorized items';

  static groupByCategory(
    items: import('./types').Item[]
  ): Record<string, import('./types').Item[]> {
    return items.reduce(
      (acc, item) => {
        const category = item.category || ItemEntity.UNCATEGORIZED_CATEGORY_KEY;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, import('./types').Item[]>
    );
  }

  static getUniqueCategories(items: import('./types').Item[]): string[] {
    const categories = items.map((item) => item.category).filter(Boolean) as string[];
    return [...new Set(categories)].sort();
  }

  static getCheckedCount(items: import('./types').Item[]): number {
    return items.filter((item) => item.is_checked).length;
  }

  static getUncheckedItems(items: import('./types').Item[]): import('./types').Item[] {
    return items.filter((item) => !item.is_checked);
  }

  static getCheckedItems(items: import('./types').Item[]): import('./types').Item[] {
    return items.filter((item) => item.is_checked);
  }
}
