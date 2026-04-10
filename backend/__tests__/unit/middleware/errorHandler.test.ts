import { Request, Response, NextFunction } from 'express';

jest.mock('@infrastructure/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

import { errorHandler } from '@middleware/errorHandler';

describe('errorHandler', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = { method: 'GET', url: '/test' } as Request;
    mockRes = { status: statusMock, json: jsonMock } as unknown as Response;
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 500 with INTERNAL_ERROR on unhandled error', () => {
    // Arrange
    const error = new Error('Something broke');

    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      },
    });
  });
});
