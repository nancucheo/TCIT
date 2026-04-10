import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PostList from './PostList';

const mockUseGetPostsQuery = vi.fn();

vi.mock('../api/postsApi', () => ({
  useGetPostsQuery: () => mockUseGetPostsQuery(),
}));

describe('PostList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Shows spinner while loading', () => {
    it('should display a spinner with role="status" while the API request is pending', () => {
      // Arrange
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      // Act
      render(<PostList />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Shows error alert', () => {
    it('should display an error alert when the API returns an error', () => {
      // Arrange
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { status: 500 },
      });

      // Act
      render(<PostList />);

      // Assert
      expect(screen.getByRole('alert')).toHaveTextContent('Error');
    });
  });

  describe('Shows empty state', () => {
    it('should display "No posts found" when the API returns an empty array', () => {
      // Arrange
      mockUseGetPostsQuery.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      // Act
      render(<PostList />);

      // Assert
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
  });

  describe('Renders posts in table', () => {
    it('should display posts in table rows when the API returns data', () => {
      // Arrange
      mockUseGetPostsQuery.mockReturnValue({
        data: [
          {
            id: 1,
            name: 'First Post',
            description: 'First description',
            createdAt: '2026-04-10T10:00:00.000Z',
            updatedAt: '2026-04-10T10:00:00.000Z',
          },
          {
            id: 2,
            name: 'Second Post',
            description: 'Second description',
            createdAt: '2026-04-10T11:00:00.000Z',
            updatedAt: '2026-04-10T11:00:00.000Z',
          },
        ],
        isLoading: false,
        isError: false,
      });

      // Act
      render(<PostList />);

      // Assert
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('First description')).toBeInTheDocument();
      expect(screen.getByText('Second description')).toBeInTheDocument();
    });
  });

  describe('Correct column headers', () => {
    it('should display Name, Description, and Action column headers', () => {
      // Arrange
      mockUseGetPostsQuery.mockReturnValue({
        data: [
          {
            id: 1,
            name: 'Post',
            description: 'Desc',
            createdAt: '2026-04-10T10:00:00.000Z',
            updatedAt: '2026-04-10T10:00:00.000Z',
          },
        ],
        isLoading: false,
        isError: false,
      });

      // Act
      render(<PostList />);

      // Assert
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});
