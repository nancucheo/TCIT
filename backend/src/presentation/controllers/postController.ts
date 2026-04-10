import { Request, Response } from 'express';
import { PostService } from '@application/services/postService';
import { PrismaPostRepository } from '@infrastructure/repositories/PrismaPostRepository';
import prisma from '@infrastructure/prismaClient';

const postRepository = new PrismaPostRepository(prisma);
const postService = new PostService(postRepository);

export class PostController {
  async getAll(_req: Request, res: Response): Promise<void> {
    const result = await postService.getAll();

    if (!result.isSuccess) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
      meta: { total: result.data!.length },
    });
  }
}
