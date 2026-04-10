import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/infrastructure/prismaClient';

describe('GET /api/v1/posts', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('I-1: Returns seeded posts', () => {
    it('should return 200 with posts and correct meta.total', async () => {
      // Arrange
      await prisma.post.createMany({
        data: [
          { name: 'Post A', description: 'Description A' },
          { name: 'Post B', description: 'Description B' },
        ],
      });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });
  });

  describe('I-2: Returns empty when no posts exist', () => {
    it('should return 200 with empty data and meta.total 0', async () => {
      // Arrange — DB is already empty from beforeEach

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });
  });

  describe('I-3: Posts are in descending createdAt order', () => {
    it('should return the most recently created post first', async () => {
      // Arrange
      await prisma.post.create({
        data: { name: 'Older Post', description: 'Created first' },
      });
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prisma.post.create({
        data: { name: 'Newer Post', description: 'Created second' },
      });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.body.data[0].name).toBe('Newer Post');
      expect(response.body.data[1].name).toBe('Older Post');
    });
  });

  describe('I-4: Response has correct schema', () => {
    it('should have success (boolean), data (array), and meta.total (number)', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(typeof response.body.success).toBe('boolean');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.meta.total).toBe('number');
    });
  });

  describe('I-5: Each post has all required fields', () => {
    it('should include id, name, description, createdAt, and updatedAt', async () => {
      // Arrange
      await prisma.post.create({
        data: { name: 'Complete Post', description: 'Has all fields' },
      });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      const post = response.body.data[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('name');
      expect(post).toHaveProperty('description');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('updatedAt');
      expect(typeof post.id).toBe('number');
      expect(typeof post.name).toBe('string');
      expect(typeof post.description).toBe('string');
      expect(typeof post.createdAt).toBe('string');
      expect(typeof post.updatedAt).toBe('string');
    });
  });
});
