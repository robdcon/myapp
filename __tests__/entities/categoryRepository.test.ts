import {
  createCategory,
  deleteCategory,
  getCategoriesByBoardId,
  seedBoardCategories,
} from '@/src/entities/category/api/categoryRepository';
import { ITEM_CATEGORIES } from '@/src/shared/config/categories';

const transactionClient = {
  query: vi.fn(),
};

vi.mock('server-only', () => ({}));

vi.mock('@/src/shared/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
  pool: {},
}));

import { query, queryOne, transaction } from '@/src/shared/lib/db';

const mockQuery = vi.mocked(query);
const mockQueryOne = vi.mocked(queryOne);
const mockTransaction = vi.mocked(transaction);

describe('categoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (callback) =>
      callback(transactionClient as never)
    );
  });

  it('returns categories alphabetically with active item counts', async () => {
    const categories = [
      { id: '2', board_id: '7', name: 'Bakery', active_item_count: 0 },
      { id: '1', board_id: '7', name: 'Fruit', active_item_count: 3 },
    ];
    mockQuery.mockResolvedValue({ rows: categories } as never);

    await expect(getCategoriesByBoardId('7')).resolves.toEqual(categories);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY category.name ASC'),
      ['7']
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('item.deleted_at IS NULL'),
      ['7']
    );
  });

  it('trims a category name before inserting', async () => {
    const category = { id: '5', board_id: '7', name: 'Dairy', active_item_count: 0 };
    mockQueryOne.mockResolvedValue(category as never);

    await expect(createCategory('7', ' Dairy ')).resolves.toEqual(category);
    expect(mockQueryOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO board_categories'),
      ['7', 'Dairy']
    );
  });

  it('seeds built-in categories in one operation for a new board', async () => {
    await seedBoardCategories(transactionClient as never, '7');

    expect(transactionClient.query).toHaveBeenCalledWith(
      expect.stringContaining('unnest($2::text[])'),
      ['7', [...ITEM_CATEGORIES]]
    );
  });

  it('blocks deletion and reports the active item count', async () => {
    transactionClient.query
      .mockResolvedValueOnce({ rows: [{ id: '4' }] })
      .mockResolvedValueOnce({ rows: [{ count: 2 }] });

    await expect(deleteCategory('7', '4')).resolves.toEqual({
      status: 'in_use',
      itemCount: 2,
    });
    expect(transactionClient.query).toHaveBeenCalledTimes(2);
    expect(transactionClient.query.mock.calls[0][0]).toContain('FOR UPDATE');
    expect(transactionClient.query.mock.calls[1][0]).toContain('deleted_at IS NULL');
  });

  it('clears soft-deleted item references before deleting an unused category', async () => {
    transactionClient.query
      .mockResolvedValueOnce({ rows: [{ id: '4' }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rowCount: 2 })
      .mockResolvedValueOnce({ rowCount: 1 });

    await expect(deleteCategory('7', '4')).resolves.toEqual({ status: 'deleted' });
    expect(transactionClient.query.mock.calls[2][0]).toContain('deleted_at IS NOT NULL');
    expect(transactionClient.query.mock.calls[3][0]).toContain(
      'DELETE FROM board_categories'
    );
  });
});
