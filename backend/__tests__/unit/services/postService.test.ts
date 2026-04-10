import { PostService } from '@application/services/postService';
import { IPostRepository } from '@domain/repositories/IPostRepository';
import { PostBuilder } from '../../../test-utils/builders/postBuilder';

jest.mock('@infrastructure/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('PostService - getAll', () => {
  let postService: PostService;
  let mockRepository: jest.Mocked<IPostRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    postService = new PostService(mockRepository);
    jest.clearAllMocks();
  });

  describe('U-1: Returns posts successfully', () => {
    it('should return Result.success with posts when repository returns data', async () => {
      // Arrange
      const posts = [
        new PostBuilder().withId(1).withName('Post 1').build(),
        new PostBuilder().withId(2).withName('Post 2').build(),
        new PostBuilder().withId(3).withName('Post 3').build(),
      ];
      mockRepository.findAll.mockResolvedValue(posts);

      // Act
      const result = await postService.getAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data![0].name).toBe('Post 1');
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('U-2: Returns empty array', () => {
    it('should return Result.success with empty array when no posts exist', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await postService.getAll();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('U-3: Repository throws Error', () => {
    it('should return Result.failure with INTERNAL_ERROR when repository throws', async () => {
      // Arrange
      mockRepository.findAll.mockRejectedValue(new Error('Connection refused'));

      // Act
      const result = await postService.getAll();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
      expect(result.error?.message).toBe('Failed to retrieve posts');
    });
  });

  describe('U-4: Repository throws non-Error value', () => {
    it('should return Result.failure when repository throws a non-Error value', async () => {
      // Arrange
      mockRepository.findAll.mockRejectedValue('unexpected string error');

      // Act
      const result = await postService.getAll();

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('PostService - create', () => {
  let postService: PostService;
  let mockRepository: jest.Mocked<IPostRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    postService = new PostService(mockRepository);
    jest.clearAllMocks();
  });

  describe('U-5: Creates post successfully', () => {
    it('should return Result.success with created post', async () => {
      // Arrange
      const input = { name: 'New Post', description: 'A description' };
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(
        new PostBuilder().withId(1).withName('New Post').withDescription('A description').build(),
      );

      // Act
      const result = await postService.create(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.data?.id).toBe(1);
      expect(result.data?.name).toBe('New Post');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('U-6: Rejects invalid input', () => {
    it('should return VALIDATION_ERROR when input is invalid', async () => {
      // Arrange
      const input = { name: '', description: '' };

      // Act
      const result = await postService.create(input);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(mockRepository.findByName).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('U-7: Rejects duplicate name', () => {
    it('should return POST_ALREADY_EXISTS when name is taken', async () => {
      // Arrange
      const input = { name: 'Existing Post', description: 'Desc' };
      mockRepository.findByName.mockResolvedValue(
        new PostBuilder().withId(1).withName('Existing Post').build(),
      );

      // Act
      const result = await postService.create(input);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('POST_ALREADY_EXISTS');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('U-8: Handles save error', () => {
    it('should return INTERNAL_ERROR when save throws', async () => {
      // Arrange
      const input = { name: 'Post', description: 'Desc' };
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.save.mockRejectedValue(new Error('DB write failed'));

      // Act
      const result = await postService.create(input);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('U-9: Handles findByName error', () => {
    it('should return INTERNAL_ERROR when findByName throws', async () => {
      // Arrange
      const input = { name: 'Post', description: 'Desc' };
      mockRepository.findByName.mockRejectedValue(new Error('DB read failed'));

      // Act
      const result = await postService.create(input);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
    });
  });
});
