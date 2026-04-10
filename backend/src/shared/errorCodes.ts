export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_ALREADY_EXISTS: 'POST_ALREADY_EXISTS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
