import {
  CategoryNameValidationError,
  normalizeCategoryName,
} from '@/src/entities/category/model/category';

describe('normalizeCategoryName', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeCategoryName('  Pantry  ')).toBe('Pantry');
  });

  it('rejects blank names', () => {
    expect(() => normalizeCategoryName('   ')).toThrow(CategoryNameValidationError);
  });

  it('rejects names longer than 50 characters', () => {
    expect(() => normalizeCategoryName('x'.repeat(51))).toThrow(
      'Category name must be 50 characters or fewer'
    );
  });

  it('allows a 50-character name', () => {
    expect(normalizeCategoryName('x'.repeat(50))).toHaveLength(50);
  });
});
