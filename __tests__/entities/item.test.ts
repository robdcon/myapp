import { ItemEntity } from '@/src/entities/item/model/item';
import type { Item } from '@/src/entities/item/model/types';

const createItem = (id: string, category: string | null): Item => ({
  id,
  board_id: '4',
  name: `Item ${id}`,
  category,
  is_checked: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

describe('ItemEntity.groupByCategory', () => {
  it('keeps uncategorized items separate from a real category named Uncategorized', () => {
    const grouped = ItemEntity.groupByCategory([
      createItem('1', null),
      createItem('2', 'Uncategorized'),
    ]);

    expect(grouped[ItemEntity.UNCATEGORIZED_CATEGORY_KEY]).toHaveLength(1);
    expect(grouped.Uncategorized).toHaveLength(1);
  });
});
