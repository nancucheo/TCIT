import { Post } from '@domain/models/Post';

export class PostBuilder {
  private data = {
    id: 1,
    name: 'Test Post',
    description: 'A test description',
    createdAt: new Date('2026-04-10T10:00:00.000Z'),
    updatedAt: new Date('2026-04-10T10:00:00.000Z'),
  };

  withId(id: number): this {
    this.data.id = id;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  withCreatedAt(date: Date): this {
    this.data.createdAt = date;
    return this;
  }

  withUpdatedAt(date: Date): this {
    this.data.updatedAt = date;
    return this;
  }

  build(): Post {
    return new Post({ ...this.data });
  }
}
