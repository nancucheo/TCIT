interface ValidationError {
  field: string;
  message: string;
  constraint: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateCreatePost(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body is required', constraint: 'isNotEmpty' }],
    };
  }

  const { name, description } = data as Record<string, unknown>;

  // Name validation
  if (name === undefined || name === null || name === '') {
    errors.push({ field: 'name', message: 'Name is required', constraint: 'isNotEmpty' });
  } else if (typeof name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string', constraint: 'isString' });
  } else {
    if (name !== name.trim()) {
      errors.push({ field: 'name', message: 'Name must not have leading or trailing whitespace', constraint: 'isTrimmed' });
    } else if (name.length > 255) {
      errors.push({ field: 'name', message: 'Name must not exceed 255 characters', constraint: 'maxLength' });
    }
  }

  // Description validation
  if (description === undefined || description === null || description === '') {
    errors.push({ field: 'description', message: 'Description is required', constraint: 'isNotEmpty' });
  } else if (typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string', constraint: 'isString' });
  } else if (description.length > 2000) {
    errors.push({ field: 'description', message: 'Description must not exceed 2000 characters', constraint: 'maxLength' });
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePostId(id: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (id === undefined || id === null || id === '') {
    errors.push({ field: 'id', message: 'ID is required', constraint: 'isNotEmpty' });
    return { isValid: false, errors };
  }

  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push({ field: 'id', message: 'ID must be a positive integer', constraint: 'isPositiveInt' });
  }

  return { isValid: errors.length === 0, errors };
}
