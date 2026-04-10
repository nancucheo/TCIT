import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PostForm from './PostForm';

const mockCreatePost = vi.fn();
const mockAddToast = vi.fn();
let mockIsLoading = false;

vi.mock('../api/postsApi', () => ({
  useCreatePostMutation: () => [
    (data: unknown) => ({
      unwrap: () => mockCreatePost(data),
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

describe('PostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
  });

  describe('Renders all fields', () => {
    it('should display Name input, Description input, and Create button', () => {
      // Arrange & Act
      render(<PostForm />);

      // Assert
      expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
    });
  });

  describe('Name required error', () => {
    it('should show "Name is required" when submitting with empty name', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PostForm />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
      });
    });
  });

  describe('Description required error', () => {
    it('should show "La descripción es obligatoria" when submitting with only name', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'Test Post');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
      });
    });
  });

  describe('Name too long error', () => {
    it('should show max length error for name exceeding 255 characters', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'a'.repeat(256));
      await user.type(screen.getByPlaceholderText('Descripción'), 'Desc');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('El nombre no debe exceder 255 caracteres')).toBeInTheDocument();
      });
    });
  });

  describe('Successful submit', () => {
    it('should call mutation with form data on valid submit', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreatePost.mockResolvedValue({ id: 1, name: 'Test', description: 'Desc' });
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'Test Post');
      await user.type(screen.getByPlaceholderText('Descripción'), 'Test description');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(mockCreatePost).toHaveBeenCalledWith({
          name: 'Test Post',
          description: 'Test description',
        });
      });
    });
  });

  describe('Form resets on success', () => {
    it('should clear fields after successful creation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreatePost.mockResolvedValue({ id: 1, name: 'Test', description: 'Desc' });
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'Test Post');
      await user.type(screen.getByPlaceholderText('Descripción'), 'Test description');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre')).toHaveValue('');
        expect(screen.getByPlaceholderText('Descripción')).toHaveValue('');
      });
    });
  });

  describe('Spinner during submit', () => {
    it('should display spinner and disable button when loading', () => {
      // Arrange
      mockIsLoading = true;

      // Act
      render(<PostForm />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Validation error from API maps to form fields', () => {
    it('should set field errors when API returns VALIDATION_ERROR with details', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreatePost.mockRejectedValue({
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: [
              { field: 'name', message: 'Name is required', constraint: 'isNotEmpty' },
            ],
          },
        },
      });
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'x');
      await user.type(screen.getByPlaceholderText('Descripción'), 'Desc');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });
  });

  describe('Generic error shows toast', () => {
    it('should show generic error toast on unexpected errors', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreatePost.mockRejectedValue({
        data: {
          success: false,
          error: { code: 'UNKNOWN_ERROR', message: 'Something unexpected' },
        },
      });
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'Test');
      await user.type(screen.getByPlaceholderText('Descripción'), 'Desc');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Ocurrió un error inesperado', 'danger');
      });
    });
  });

  describe('Conflict error toast', () => {
    it('should show toast error when API returns 409', async () => {
      // Arrange
      const user = userEvent.setup();
      mockCreatePost.mockRejectedValue({
        data: {
          success: false,
          error: {
            code: 'POST_ALREADY_EXISTS',
            message: "A post with name 'Test' already exists",
          },
        },
      });
      render(<PostForm />);

      // Act
      await user.type(screen.getByPlaceholderText('Nombre'), 'Test');
      await user.type(screen.getByPlaceholderText('Descripción'), 'Desc');
      await user.click(screen.getByRole('button', { name: 'Crear' }));

      // Assert
      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          "A post with name 'Test' already exists",
          'danger',
        );
      });
    });
  });
});
