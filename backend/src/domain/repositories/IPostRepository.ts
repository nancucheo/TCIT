import { Post } from '../models/Post';

export interface IPostRepository {
  findAll(): Promise<Post[]>;
  findById(id: number): Promise<Post | null>;
  findByName(name: string): Promise<Post | null>;
  save(post: Post): Promise<Post>;
  delete(id: number): Promise<Post | null>;
}
