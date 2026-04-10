import { PrismaClient } from '@prisma/client';
import { Post } from '@domain/models/Post';
import { IPostRepository } from '@domain/repositories/IPostRepository';

export class PrismaPostRepository implements IPostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Post[]> {
    const records = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: number): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findByName(name: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({
      where: { name },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async save(post: Post): Promise<Post> {
    const record = await this.prisma.post.create({
      data: {
        name: post.name,
        description: post.description,
      },
    });

    return this.toDomain(record);
  }

  async delete(id: number): Promise<Post | null> {
    try {
      const record = await this.prisma.post.delete({
        where: { id },
      });

      return this.toDomain(record);
    } catch {
      // Prisma throws P2025 when the record to delete is not found
      return null;
    }
  }

  private toDomain(record: {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }): Post {
    return new Post({
      id: record.id,
      name: record.name,
      description: record.description,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
