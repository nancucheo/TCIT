import { Request, Response, NextFunction } from 'express';
import logger from '@infrastructure/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTimeMs = Date.now() - startTime;

    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTimeMs,
      },
      'Request completed'
    );
  });

  next();
}
