import {
  createItem,
  getItemsByBoardId,
  ItemCategoryNotFoundError,
  toggleItemChecked,
  getItemById,
} from '@/src/entities/item/api/itemRepository';

const transactionClient = {
  query: vi.fn(),
};

vi.mock('server-only', () => ({}));

vi.mock('@/src/shared/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  queryMany: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
  pool: {},
}));

import { query, queryOne, transaction } from '@/src/shared/lib/db';

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockTransaction = vi.mocked(transaction);

const sampleItem = {
  id: '10',
  board_id: '1',
  name: 'Buy milk',
  details: null,
  category: 'Groceries',
  is_checked: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

describe('itemRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (callback) =>
      callback(transactionClient as never)
    );
  });

  describe('getItemsByBoardId', () => {
    it('returns an array of items for the given board', async () => {
      mockQuery.mockResolvedValue({ rows: [sampleItem] } as any);

      const result = await getItemsByBoardId('1');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE item.board_id = $1'),
        ['1']
      );
      expect(result).toEqual([sampleItem]);
    });

    it('returns an empty array when the board has no items', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getItemsByBoardId('empty-board');

      expect(result).toEqual([]);
    });
  });

  describe('toggleItemChecked', () => {
    it('calls queryOne with the correct UPDATE SQL and item id', async () => {
      const toggled = { ...sampleItem, is_checked: true };
      mockQueryOne.mockResolvedValue(toggled);

      const result = await toggleItemChecked('10');

      expect(mockQueryOne).toHaveBeenCalledWith(
        expect.stringContaining('SET is_checked = NOT is_checked'),
        ['10']
      );
      expect(result).toEqual(toggled);
    });

    it('returns null when the item is not found', async () => {
      mockQueryOne.mockResolvedValue(null);

      const result = await toggleItemChecked('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getItemById', () => {
    it('returns the item when found', async () => {
      mockQueryOne.mockResolvedValue(sampleItem);

      const result = await getItemById('10');

      expect(mockQueryOne).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN board_categories'),
        ['10']
      );
      expect(result).toEqual(sampleItem);
    });

    it('returns null when the item is not found', async () => {
      mockQueryOne.mockResolvedValue(null);

      const result = await getItemById('999');

      expect(result).toBeNull();
    });

    describe('createItem', () => {
      it('locks and resolves a board category before creating the item', async () => {
        transactionClient.query
          .mockResolvedValueOnce({ rows: [{ id: '15', name: 'Pantry' }] })
          .mockResolvedValueOnce({ rows: [{ ...sampleItem, category: undefined }] });

        const result = await createItem({
          boardId: '1',
          name: 'Rice',
          category: ' pantry ',
        });

        expect(transactionClient.query.mock.calls[0][0]).toContain('FOR KEY SHARE');
        expect(transactionClient.query.mock.calls[1][0]).toContain('category_id');
        expect(transactionClient.query.mock.calls[1][1]).toEqual([
          '1',
          'Rice',
          undefined,
          '15',
          undefined,
        ]);
        expect(result?.category).toBe('Pantry');
      });

      it('rejects a category not available on the selected board', async () => {
        transactionClient.query.mockResolvedValueOnce({ rows: [] });

        await expect(
          createItem({ boardId: '1', name: 'Rice', category: 'Missing' })
        ).rejects.toBeInstanceOf(ItemCategoryNotFoundError);
        expect(transactionClient.query).toHaveBeenCalledTimes(1);
      });
    });
  });
});
