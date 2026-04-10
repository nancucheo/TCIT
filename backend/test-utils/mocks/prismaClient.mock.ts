export const mockPrismaClient = {
  post: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $queryRaw: jest.fn(),
};
