import { Request, Response } from 'express';
import { PostService } from '@application/services/postService';
import { PrismaPostRepository } from '@infrastructure/repositories/PrismaPostRepository';
import prisma from '@infrastructure/prismaClient';

const postRepository = new PrismaPostRepository(prisma);
const postService = new PostService(postRepository);

const ERROR_STATUS_MAP: Record<string, number> = {
  VALIDATION_ERROR: 400,
  POST_NOT_FOUND: 404,
  POST_ALREADY_EXISTS: 409,
  INTERNAL_ERROR: 500,
};

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

  async create(req: Request, res: Response): Promise<void> {
    const result = await postService.create(req.body);

    if (!result.isSuccess) {
      const status = ERROR_STATUS_MAP[result.error!.code] || 500;
      res.status(status).json({ success: false, error: result.error });
      return;
    }

    res.status(201).json({ success: true, data: result.data });
  }
}
