import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PostItem from './PostItem';

const mockDeletePost = vi.fn();
const mockAddToast = vi.fn();
let mockIsLoading = false;

vi.mock('../api/postsApi', () => ({
  useDeletePostMutation: () => [
    (id: number) => ({
      unwrap: () => mockDeletePost(id),
    }),
    { isLoading: mockIsLoading },
  ],
}));

vi.mock('@shared/components/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast,
    toasts: [],
    removeToast: vi.fn(),
  }),
}));

const mockPost = {
  id: 1,
  name: 'Test Post',
  description: 'Test description',
  createdAt: '2026-04-10T10:00:00.000Z',
  updatedAt: '2026-04-10T10:00:00.000Z',
};

const renderPostItem = () => {
  return render(
    <table>
      <tbody>
        <PostItem post={mockPost} />
      </tbody>
    </table>,
  );
};

describe('PostItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
  });

  describe('Renders post data', () => {
    it('should display name and description', () => {
      // Arrange & Act
      renderPostItem();

      // Assert
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('Shows Delete button', () => {
    it('should display a Delete button', () => {
      // Arrange & Act
      renderPostItem();

      // Assert
      expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    });
  });

  describe('Calls delete mutation', () => {
    it('should call deletePost with post id when clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      mockDeletePost.mockResolvedValue(mockPost);
      renderPostItem();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      await waitFor(() => {
        expect(mockDeletePost).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Spinner during delete', () => {
    it('should show spinner and disable button when loading', () => {
      // Arrange
      mockIsLoading = true;

      // Act
      renderPostItem();

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Success toast', () => {
    it('should show success toast after delete', async () => {
      // Arrange
      const user = userEvent.setup();
      mockDeletePost.mockResolvedValue(mockPost);
      renderPostItem();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Post eliminado exitosamente', 'success');
      });
    });
  });

  describe('Error toast', () => {
    it('should show error toast when delete fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockDeletePost.mockRejectedValue(new Error('Failed'));
      renderPostItem();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      // Assert
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Error al eliminar el post', 'danger');
      });
    });
  });
});
