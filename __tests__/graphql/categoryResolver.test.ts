import { GraphQLError } from 'graphql';
import { categoryResolvers } from '@/graphql/resolvers/category.resolver';

vi.mock('@/src/entities/category/api/categoryRepository', () => ({
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategoriesByBoardId: vi.fn(),
}));

vi.mock('@/graphql/resolvers/permissions', () => ({
  checkBoardEditPermission: vi.fn(),
  checkBoardViewPermission: vi.fn(),
}));

import {
  createCategory,
  deleteCategory,
} from '@/src/entities/category/api/categoryRepository';
import { checkBoardEditPermission } from '@/graphql/resolvers/permissions';

const mockCreateCategory = vi.mocked(createCategory);
const mockDeleteCategory = vi.mocked(deleteCategory);
const mockEditPermission = vi.mocked(checkBoardEditPermission);

describe('categoryResolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEditPermission.mockResolvedValue(true);
  });

  it('requires authentication before category management', async () => {
    await expect(
      categoryResolvers.Mutation.createCategory(
        null,
        { boardId: '4', name: 'Pantry' },
        {} as never
      )
    ).rejects.toMatchObject({ extensions: { code: 'UNAUTHENTICATED' } });
    expect(mockEditPermission).not.toHaveBeenCalled();
  });

  it('trims and creates a category after checking edit permission', async () => {
    const category = {
      id: '9',
      board_id: '4',
      name: 'Pantry',
      active_item_count: 0,
    };
    mockCreateCategory.mockResolvedValue(category);

    await expect(
      categoryResolvers.Mutation.createCategory(
        null,
        { boardId: '4', name: ' Pantry ' },
        { user: { sub: 'auth0|editor' } } as never
      )
    ).resolves.toEqual(category);
    expect(mockEditPermission).toHaveBeenCalledWith('4', 'auth0|editor');
    expect(mockCreateCategory).toHaveBeenCalledWith('4', 'Pantry');
  });

  it('rejects category names that normalize to blank', async () => {
    await expect(
      categoryResolvers.Mutation.createCategory(null, { boardId: '4', name: '   ' }, {
        user: { sub: 'auth0|editor' },
      } as never)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    expect(mockCreateCategory).not.toHaveBeenCalled();
  });

  it('reports active item usage when deletion is blocked', async () => {
    mockDeleteCategory.mockResolvedValue({ status: 'in_use', itemCount: 3 });

    const error = await categoryResolvers.Mutation.deleteCategory(
      null,
      { boardId: '4', categoryId: '9' },
      { user: { sub: 'auth0|editor' } } as never
    ).catch((value: unknown) => value);

    expect(error).toBeInstanceOf(GraphQLError);
    expect((error as GraphQLError).extensions).toMatchObject({
      code: 'CATEGORY_IN_USE',
      activeItemCount: 3,
    });
    expect((error as Error).message).toContain('3 active items use it');
  });
});
