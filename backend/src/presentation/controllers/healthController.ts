import { Request, Response } from 'express';
import prisma from '@infrastructure/prismaClient';

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: { database: 'connected' },
      });
    } catch {
      res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dependencies: { database: 'disconnected' },
      });
    }
  }
}
