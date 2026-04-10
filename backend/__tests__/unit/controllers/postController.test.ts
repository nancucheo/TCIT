import { Request, Response } from 'express';

// Mock dependencies before importing controller
jest.mock('@infrastructure/prismaClient', () => ({
  __esModule: true,
  default: {
    post: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@infrastructure/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

import { PostController } from '@presentation/controllers/postController';
import prisma from '@infrastructure/prismaClient';

const mockPrisma = prisma as unknown as {
  post: { findMany: jest.Mock };
};

describe('PostController - getAll', () => {
  let controller: PostController;
  let mockReq: Request;
  let mockRes: Response;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    controller = new PostController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {} as Request;
    mockRes = { status: statusMock, json: jsonMock } as unknown as Response;
    jest.clearAllMocks();
  });

  describe('U-1: Returns 200 with posts', () => {
    it('should return 200 with success, data, and meta when posts exist', async () => {
      // Arrange
      mockPrisma.post.findMany.mockResolvedValue([
        { id: 1, name: 'Post 1', description: 'Desc 1', createdAt: new Date(), updatedAt: new Date() },
      ]);

      // Act
      await controller.getAll(mockReq, mockRes);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
          meta: { total: 1 },
        }),
      );
    });
  });

  describe('U-2: Returns 500 on service failure', () => {
    it('should return 500 with error when the service fails', async () => {
      // Arrange
      mockPrisma.post.findMany.mockRejectedValue(new Error('DB down'));

      // Act
      await controller.getAll(mockReq, mockRes);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
          }),
        }),
      );
    });
  });
});
