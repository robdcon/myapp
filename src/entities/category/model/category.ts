export class CategoryNameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryNameValidationError';
  }
}

export function normalizeCategoryName(name: string): string {
  const normalized = name.trim();
  if (!normalized) {
    throw new CategoryNameValidationError('Category name cannot be blank');
  }
  if (normalized.length > 50) {
    throw new CategoryNameValidationError('Category name must be 50 characters or fewer');
  }
  return normalized;
}
