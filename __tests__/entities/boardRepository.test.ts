import {
  getBoardById,
  getBoardsByUserId,
} from '@/src/entities/board/api/boardRepository';
import { BoardType } from '@/src/entities/board/model/types';

vi.mock('@/src/shared/lib/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  queryMany: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
  pool: {},
}));

import { query, queryOne } from '@/src/shared/lib/db';

const mockQueryOne = vi.mocked(queryOne);
const mockQuery = vi.mocked(query);

const sampleBoard = {
  id: '1',
  name: 'Test Board',
  description: 'A test board',
  board_type: BoardType.CHECKLIST,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('boardRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBoardById', () => {
    it('returns the board when found', async () => {
      mockQueryOne.mockResolvedValue(sampleBoard);

      const result = await getBoardById('1');

      expect(mockQueryOne).toHaveBeenCalledWith('SELECT * FROM boards WHERE id = $1', [
        '1',
      ]);
      expect(result).toEqual(sampleBoard);
    });

    it('returns null when the board is not found', async () => {
      mockQueryOne.mockResolvedValue(null);

      const result = await getBoardById('999');

      expect(result).toBeNull();
    });
  });

  describe('getBoardsByUserId', () => {
    it('returns an array of boards for the given user', async () => {
      const boardRows = [{ ...sampleBoard, role: 'admin' }];
      mockQuery.mockResolvedValue({ rows: boardRows } as any);

      const result = await getBoardsByUserId('user-1');

      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('user_boards'), [
        'user-1',
      ]);
      expect(result).toEqual(boardRows);
    });

    it('returns an empty array when the user has no boards', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getBoardsByUserId('user-no-boards');

      expect(result).toEqual([]);
    });
  });
});
