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

describe('POST /api/v1/posts', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('I-6: Creates post successfully', () => {
    it('should return 201 with created post data', async () => {
      // Arrange & Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'New Post', description: 'Content here' });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Post');
      expect(response.body.data.description).toBe('Content here');
      expect(response.body.data.id).toBeDefined();
    });
  });

  describe('I-7: Rejects empty name', () => {
    it('should return 400 with VALIDATION_ERROR', async () => {
      // Arrange & Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: '', description: 'Content' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('I-8: Rejects missing description', () => {
    it('should return 400 with VALIDATION_ERROR', async () => {
      // Arrange & Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'Post' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('I-9: Rejects name exceeding 255 characters', () => {
    it('should return 400 with maxLength detail', async () => {
      // Arrange & Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'a'.repeat(256), description: 'X' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({ field: 'name', constraint: 'maxLength' }),
      );
    });
  });

  describe('I-10: Rejects duplicate name', () => {
    it('should return 409 with POST_ALREADY_EXISTS', async () => {
      // Arrange
      await prisma.post.create({ data: { name: 'Existing', description: 'Desc' } });

      // Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'Existing', description: 'Another desc' });

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('POST_ALREADY_EXISTS');
    });
  });

  describe('I-11: Created post appears in list', () => {
    it('should be visible in GET /api/v1/posts after creation', async () => {
      // Arrange
      await request(app)
        .post('/api/v1/posts')
        .send({ name: 'Listed Post', description: 'Should appear' });

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      expect(response.body.data).toContainEqual(
        expect.objectContaining({ name: 'Listed Post' }),
      );
    });
  });

  describe('I-12: Timestamps present', () => {
    it('should include valid ISO timestamps', async () => {
      // Arrange & Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'Timestamped', description: 'Has dates' });

      // Assert
      const post = response.body.data;
      expect(typeof post.createdAt).toBe('string');
      expect(typeof post.updatedAt).toBe('string');
      expect(() => new Date(post.createdAt)).not.toThrow();
      expect(() => new Date(post.updatedAt)).not.toThrow();
    });
  });

  describe('I-13: Content-Type JSON', () => {
    it('should return JSON content-type on 201', async () => {
      // Arrange & Act
      const response = await request(app)
        .post('/api/v1/posts')
        .send({ name: 'JSON Post', description: 'Content type test' });

      // Assert
      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});

describe('DELETE /api/v1/posts/:id', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('I-14: Delete existing post', () => {
    it('should return 200 with deleted post data', async () => {
      // Arrange
      const created = await prisma.post.create({
        data: { name: 'To Delete', description: 'Will be deleted' },
      });

      // Act
      const response = await request(app).delete(`/api/v1/posts/${created.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(created.id);
      expect(response.body.data.name).toBe('To Delete');
    });
  });

  describe('I-15: ID not found', () => {
    it('should return 404 with POST_NOT_FOUND', async () => {
      // Arrange & Act
      const response = await request(app).delete('/api/v1/posts/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('POST_NOT_FOUND');
    });
  });

  describe('I-16: ID non-numeric', () => {
    it('should return 400 with VALIDATION_ERROR', async () => {
      // Arrange & Act
      const response = await request(app).delete('/api/v1/posts/abc');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('I-17: ID negative', () => {
    it('should return 400 with VALIDATION_ERROR', async () => {
      // Arrange & Act
      const response = await request(app).delete('/api/v1/posts/-1');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('I-18: Post disappears from list', () => {
    it('should not appear in GET /api/v1/posts after deletion', async () => {
      // Arrange
      const created = await prisma.post.create({
        data: { name: 'Disappearing Post', description: 'Gone soon' },
      });
      await request(app).delete(`/api/v1/posts/${created.id}`);

      // Act
      const response = await request(app).get('/api/v1/posts');

      // Assert
      const names = response.body.data.map((p: { name: string }) => p.name);
      expect(names).not.toContain('Disappearing Post');
    });
  });
});
