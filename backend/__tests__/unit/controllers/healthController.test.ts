import { Request, Response } from 'express';
import { HealthController } from '@presentation/controllers/healthController';

// Mock the prisma client module
jest.mock('@infrastructure/prismaClient', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  },
}));

import prisma from '@infrastructure/prismaClient';

const mockPrisma = prisma as unknown as { $queryRaw: jest.Mock };

describe('HealthController', () => {
  let healthController: HealthController;
  let mockReq: Request;
  let mockRes: Response;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    healthController = new HealthController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {} as Request;
    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    jest.clearAllMocks();
  });

  describe('U-1: Returns 200 when DB is connected', () => {
    it('should return HTTP 200 when $queryRaw resolves successfully', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ok' }),
      );
    });
  });

  describe('U-2: Returns 503 when DB is down', () => {
    it('should return HTTP 503 when $queryRaw rejects', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockRejectedValueOnce(
        new Error('Connection refused'),
      );

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'degraded' }),
      );
    });
  });

  describe('U-3: Response includes all required fields', () => {
    it('should include status, timestamp, uptime, and dependencies.database when DB is connected', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          dependencies: { database: 'connected' },
        }),
      );
    });

    it('should include status, timestamp, uptime, and dependencies.database when DB is disconnected', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'degraded',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          dependencies: { database: 'disconnected' },
        }),
      );
    });
  });

  describe('U-4: Timestamp is valid ISO 8601', () => {
    it('should return a valid ISO 8601 timestamp when DB is connected', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      const body = jsonMock.mock.calls[0][0] as { timestamp: string };
      expect(() => new Date(body.timestamp)).not.toThrow();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    it('should return a valid ISO 8601 timestamp when DB is disconnected', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      const body = jsonMock.mock.calls[0][0] as { timestamp: string };
      expect(() => new Date(body.timestamp)).not.toThrow();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });
  });

  describe('U-5: Uptime is a non-negative number', () => {
    it('should return a non-negative uptime number when DB is connected', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      const body = jsonMock.mock.calls[0][0] as { uptime: number };
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return a non-negative uptime number when DB is disconnected', async () => {
      // Arrange
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB down'));

      // Act
      await healthController.check(mockReq, mockRes);

      // Assert
      const body = jsonMock.mock.calls[0][0] as { uptime: number };
      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
