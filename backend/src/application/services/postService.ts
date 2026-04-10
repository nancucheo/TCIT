import { IPostRepository } from '@domain/repositories/IPostRepository';
import { Post } from '@domain/models/Post';
import { Result } from '@shared/Result';
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
}
