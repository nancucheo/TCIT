import { IPostRepository } from '@domain/repositories/IPostRepository';
import { Post, CreatePostDto } from '@domain/models/Post';
import { Result } from '@shared/Result';
import { validateCreatePost, validatePostId } from '@application/validators/postValidator';
import logger from '@infrastructure/logger';

export class PostService {
  constructor(private readonly postRepository: IPostRepository) {}

  async getAll(): Promise<Result<Post[]>> {
    try {
      const posts = await this.postRepository.findAll();
      return Result.success(posts);
    } catch (error) {
      logger.error({ error }, 'Failed to retrieve posts');
      return Result.failure('INTERNAL_ERROR', 'Failed to retrieve posts');
    }
  }

  async create(data: unknown): Promise<Result<Post>> {
    const validation = validateCreatePost(data);
    if (!validation.isValid) {
      return Result.failure('VALIDATION_ERROR', 'Invalid input data', validation.errors);
    }

    const { name, description } = data as CreatePostDto;

    try {
      const existing = await this.postRepository.findByName(name);
      if (existing) {
        return Result.failure('POST_ALREADY_EXISTS', `A post with name '${name}' already exists`);
      }

      const post = new Post({ name, description });
      const saved = await this.postRepository.save(post);
      return Result.success(saved);
    } catch (error) {
      logger.error({ error }, 'Failed to create post');
      return Result.failure('INTERNAL_ERROR', 'Failed to create post');
    }
  }

  async delete(id: unknown): Promise<Result<Post>> {
    const validation = validatePostId(id);
    if (!validation.isValid) {
      return Result.failure('VALIDATION_ERROR', 'Invalid post ID', validation.errors);
    }

    const parsedId = Number(id);

    try {
      const existing = await this.postRepository.findById(parsedId);
      if (!existing) {
        return Result.failure('POST_NOT_FOUND', `Post with id ${parsedId} not found`);
      }

      const deleted = await this.postRepository.delete(parsedId);
      return Result.success(deleted!);
    } catch (error) {
      logger.error({ error }, 'Failed to delete post');
      return Result.failure('INTERNAL_ERROR', 'Failed to delete post');
    }
  }
}
