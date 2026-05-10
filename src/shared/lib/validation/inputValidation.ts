/**
 * Application-level input validation utilities for GraphQL mutation resolvers.
 *
 * These guards run before any repository call, enforcing business-rule
 * constraints (length, format, type) regardless of what the database layer
 * would accept. This satisfies the OWASP A03 injection-defence layering
 * requirement on top of the parameterised queries already in place.
 */

/** Thrown by validation helpers when user-supplied input is invalid. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface StringFieldOptions {
  /** When true, an absent / blank value throws. Default: false. */
  required?: boolean;
  /** Inclusive upper bound on trimmed length. */
  maxLength?: number;
  /** Inclusive lower bound on trimmed length. */
  minLength?: number;
  /** Optional regex the trimmed value must fully satisfy. */
  pattern?: RegExp;
  /** Human-readable message surfaced when the pattern check fails. */
  patternMessage?: string;
}

/**
 * Validate a string field against common constraints.
 *
 * - `undefined` / `null` values are only rejected when `required` is true.
 * - All length checks are performed on the *trimmed* value so that
 *   whitespace-only input is treated the same as empty input.
 *
 * @throws {ValidationError} on any constraint violation.
 */
export function validateStringField(
  value: string | undefined | null,
  fieldName: string,
  options: StringFieldOptions = {}
): void {
  const { required = false, maxLength, minLength, pattern, patternMessage } = options;

  // Treat blank strings the same as absent values.
  if (value === undefined || value === null || value.trim() === '') {
    if (required) {
      throw new ValidationError(`"${fieldName}" is required and cannot be empty.`);
    }
    return;
  }

  const trimmed = value.trim();

  if (minLength !== undefined && trimmed.length < minLength) {
    throw new ValidationError(
      `"${fieldName}" must be at least ${minLength} character${minLength === 1 ? '' : 's'} long.`
    );
  }

  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new ValidationError(`"${fieldName}" must not exceed ${maxLength} characters.`);
  }

  if (pattern !== undefined && !pattern.test(trimmed)) {
    throw new ValidationError(
      patternMessage ?? `"${fieldName}" contains invalid characters.`
    );
  }
}

/**
 * Validate that an ID value represents a positive integer.
 *
 * GraphQL `ID` scalars arrive at the resolver as strings. This helper
 * converts the value with `Number()` and confirms the result is a
 * finite, positive, whole number — rejecting floats, zero, negatives,
 * and non-numeric strings.
 *
 * @throws {ValidationError} when the value is not a positive integer.
 */
export function validateId(value: unknown, fieldName: string): void {
  const str = String(value);
  if (!/^\d+$/.test(str)) {
    throw new ValidationError(`"${fieldName}" must be a positive integer.`);
  }
  const num = parseInt(str, 10);
  if (num <= 0) {
    throw new ValidationError(`"${fieldName}" must be a positive integer.`);
  }
}
