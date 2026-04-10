export interface CreatePostDto {
  name: string;
  description: string;
}

export class Post {
  public readonly id?: number;
  public readonly name: string;
  public readonly description: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(params: {
    id?: number;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
