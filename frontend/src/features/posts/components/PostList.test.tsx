import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PostList from './PostList';

const mockUseGetPostsQuery = vi.fn();
const mockUsePostFilter = vi.fn();

vi.mock('../api/postsApi', () => ({
  useGetPostsQuery: () => mockUseGetPostsQuery(),
  useDeletePostMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock('../hooks/usePostFilter', () => ({
  usePostFilter: (posts: unknown) => mockUsePostFilter(posts),
}));

vi.mock('@shared/components/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
    toasts: [],
    removeToast: vi.fn(),
  }),
}));

const mockPosts = [
  { id: 1, name: 'First Post', description: 'First description', createdAt: '2026-04-10T10:00:00.000Z', updatedAt: '2026-04-10T10:00:00.000Z' },
  { id: 2, name: 'Second Post', description: 'Second description', createdAt: '2026-04-10T11:00:00.000Z', updatedAt: '2026-04-10T11:00:00.000Z' },
];

describe('PostList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: usePostFilter returns what it receives (no filtering)
    mockUsePostFilter.mockImplementation((posts: unknown) => posts ?? []);
  });

  describe('Shows spinner while loading', () => {
    it('should display a spinner with role="status" while the API request is pending', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false });
      render(<PostList />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Shows error alert', () => {
    it('should display an error alert when the API returns an error', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: { status: 500 } });
      render(<PostList />);
      expect(screen.getByRole('alert')).toHaveTextContent('Error');
    });
  });

  describe('Shows empty state — no posts', () => {
    it('should display "No posts found" when the API returns an empty array', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
      mockUsePostFilter.mockReturnValue([]);
      render(<PostList />);
      expect(screen.getByText('No se encontraron posts')).toBeInTheDocument();
    });
  });

  describe('Renders posts in table with Eliminar buttons', () => {
    it('should display posts in table rows with Eliminar buttons', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: mockPosts, isLoading: false, isError: false });
      mockUsePostFilter.mockReturnValue(mockPosts);
      render(<PostList />);
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);
    });
  });

  describe('Correct column headers', () => {
    it('should display Nombre, Descripción, and Acción column headers', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: mockPosts, isLoading: false, isError: false });
      mockUsePostFilter.mockReturnValue(mockPosts);
      render(<PostList />);
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Descripción')).toBeInTheDocument();
      expect(screen.getByText('Acción')).toBeInTheDocument();
    });
  });

  describe('Shows filtered posts', () => {
    it('should display only filtered posts', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: mockPosts, isLoading: false, isError: false });
      mockUsePostFilter.mockReturnValue([mockPosts[0]]);
      render(<PostList />);
      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.queryByText('Second Post')).not.toBeInTheDocument();
    });
  });

  describe('Shows "no match" message', () => {
    it('should display "No posts match your filter" when filter excludes all', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: mockPosts, isLoading: false, isError: false });
      mockUsePostFilter.mockReturnValue([]);
      render(<PostList />);
      expect(screen.getByText('Ningún post coincide con tu filtro')).toBeInTheDocument();
    });
  });

  describe('Differentiates no posts vs no matches', () => {
    it('should show "No posts found" when API returns empty, not "no match"', () => {
      mockUseGetPostsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
      mockUsePostFilter.mockReturnValue([]);
      render(<PostList />);
      expect(screen.getByText('No se encontraron posts')).toBeInTheDocument();
      expect(screen.queryByText('Ningún post coincide con tu filtro')).not.toBeInTheDocument();
    });
  });
});
