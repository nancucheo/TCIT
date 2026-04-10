import { validateCreatePost } from '@application/validators/postValidator';

describe('validateCreatePost', () => {
  describe('V-1: Valid input', () => {
    it('should return isValid true for valid input', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'Post', description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('V-2: Name empty string', () => {
    it('should return error for empty name', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: '', description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', constraint: 'isNotEmpty' }),
      );
    });
  });

  describe('V-3: Name missing', () => {
    it('should return error when name is not provided', () => {
      // Arrange & Act
      const result = validateCreatePost({ description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', constraint: 'isNotEmpty' }),
      );
    });
  });

  describe('V-4: Name too long', () => {
    it('should return error for name exceeding 255 characters', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'a'.repeat(256), description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', constraint: 'maxLength' }),
      );
    });
  });

  describe('V-5: Name with leading/trailing spaces', () => {
    it('should return error for untrimmed name', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: ' Post ', description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', constraint: 'isTrimmed' }),
      );
    });
  });

  describe('V-6: Description empty', () => {
    it('should return error for empty description', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'Post', description: '' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'description', constraint: 'isNotEmpty' }),
      );
    });
  });

  describe('V-7: Description too long', () => {
    it('should return error for description exceeding 2000 characters', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'Post', description: 'a'.repeat(2001) });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'description', constraint: 'maxLength' }),
      );
    });
  });

  describe('V-8: Name not a string', () => {
    it('should return error when name is a number', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 123, description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'name', constraint: 'isString' }),
      );
    });
  });

  describe('V-9: Description not a string', () => {
    it('should return error when description is a number', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'Post', description: 123 });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'description', constraint: 'isString' }),
      );
    });
  });

  describe('V-10: Body null', () => {
    it('should return error for null body', () => {
      // Arrange & Act
      const result = validateCreatePost(null);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'body', constraint: 'isNotEmpty' }),
      );
    });
  });

  describe('V-11: Body undefined', () => {
    it('should return error for undefined body', () => {
      // Arrange & Act
      const result = validateCreatePost(undefined);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'body', constraint: 'isNotEmpty' }),
      );
    });
  });

  describe('V-12: Multiple errors', () => {
    it('should return multiple errors when both fields are invalid', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: '', description: '' });

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('V-13: Name at boundary (255 chars)', () => {
    it('should accept name of exactly 255 characters', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'a'.repeat(255), description: 'Desc' });

      // Assert
      expect(result.isValid).toBe(true);
    });
  });

  describe('V-14: Description at boundary (2000 chars)', () => {
    it('should accept description of exactly 2000 characters', () => {
      // Arrange & Act
      const result = validateCreatePost({ name: 'Post', description: 'a'.repeat(2000) });

      // Assert
      expect(result.isValid).toBe(true);
    });
  });
});
