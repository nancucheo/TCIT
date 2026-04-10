import request from 'supertest';
import app from '../../src/app';

describe('GET /api/v1/health', () => {
  describe('I-1: Returns 200', () => {
    it('should return HTTP 200 when the database is reachable', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/health');

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe('I-2: Response has correct content-type', () => {
    it('should respond with application/json content-type', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/health');

      // Assert
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('I-3: Response body has required shape', () => {
    it('should return status ok, a string timestamp, a numeric uptime, and database connected', async () => {
      // Arrange & Act
      const response = await request(app).get('/api/v1/health');

      // Assert
      expect(response.body).toMatchObject({
        status: 'ok',
        dependencies: { database: 'connected' },
      });
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
    });
  });
});
