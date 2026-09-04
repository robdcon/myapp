import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/shared/lib/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from '@/src/shared/lib/db';
import {
  checkBoardEditPermission,
  checkBoardViewPermission,
  getBoardRoleForUser,
} from '@/graphql/resolvers/permissions';
import { boardShareResolvers } from '@/graphql/resolvers/board-share.resolver';

const mockPoolQuery = vi.mocked(pool.query);

describe('board permission checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows edit access for owners and editors regardless of role casing', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ has_permission: true }] } as any);

    await expect(checkBoardEditPermission('42', 'auth0|user-1')).resolves.toBe(true);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining("LOWER(ub.role) IN ('owner', 'editor')"),
      ['42', 'auth0|user-1']
    );
  });

  it('allows view access for shared board permissions', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ has_permission: true }] } as any);

    await expect(checkBoardViewPermission('42', 'auth0|user-1')).resolves.toBe(true);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining("LOWER(bs.permission_level) IN ('view', 'edit', 'admin')"),
      ['42', 'auth0|user-1']
    );
  });

  it('allows editors to keep edit access when their board role is stored in uppercase', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ has_permission: true }] } as any);

    await expect(checkBoardEditPermission('42', 'auth0|user-1')).resolves.toBe(true);

    expect(mockPoolQuery.mock.calls[0][0]).toContain("LOWER(ub.role) IN ('owner', 'editor')");
  });

  it('normalizes membership roles before returning them', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ role: 'OWNER' }] } as any);

    await expect(getBoardRoleForUser('42', 'auth0|user-1')).resolves.toBe('owner');
  });
});

describe('board share authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects share creation when the current user lacks admin permissions', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ can_share: false }] } as any);

    await expect(
      boardShareResolvers.Mutation.shareBoard(
        {},
        { boardId: '42', email: 'friend@example.com', permission: 'EDIT' },
        { user: { sub: 'auth0|user-1' } }
      )
    ).rejects.toMatchObject({
      message: 'You do not have permission to share this board',
      extensions: { code: 'FORBIDDEN' },
    });
  });

  it('allows board admins to share a board with a new user', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ can_share: true }] } as any);
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ auth0_id: 'auth0|friend' }] } as any);
    mockPoolQuery.mockResolvedValueOnce({ rows: [] } as any);
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 'share-1' }] } as any);
    mockPoolQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'share-1',
          board_id: '42',
          shared_with_user_id: 'auth0|friend',
          shared_by_user_id: 'auth0|user-1',
          permission_level: 'EDIT',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          shared_with_user_email: 'friend@example.com',
          shared_with_user_name: 'Friend User',
        },
      ],
    } as any);

    await expect(
      boardShareResolvers.Mutation.shareBoard(
        {},
        { boardId: '42', email: 'friend@example.com', permission: 'EDIT' },
        { user: { sub: 'auth0|user-1' } }
      )
    ).resolves.toMatchObject({
      board_id: '42',
      shared_with_user_id: 'auth0|friend',
      permission_level: 'EDIT',
    });

    expect(mockPoolQuery.mock.calls[0][1]).toEqual(['42', 'auth0|user-1']);
  });

  it('returns a shared board permission for board members with a direct share', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [] } as any);
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ permission_level: 'EDIT' }] } as any);

    await expect(
      boardShareResolvers.Board.myPermission(
        { id: '42' },
        {},
        { user: { sub: 'auth0|user-1' } }
      )
    ).resolves.toBe('EDIT');
  });
});
