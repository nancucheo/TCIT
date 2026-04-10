import { Request, Response, NextFunction } from 'express';
import logger from '@infrastructure/logger';

// Express error-handling middleware must have exactly 4 parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
      },
      method: req.method,
      url: req.url,
    },
    'Unhandled error'
  );

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  });
}
