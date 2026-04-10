import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PostFilter from './PostFilter';

const mockDispatch = vi.fn();

vi.mock('@app/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => '',
}));

describe('PostFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renders input and button', () => {
    it('should display input with placeholder and Search button', () => {
      // Arrange & Act
      render(<PostFilter />);

      // Assert
      expect(screen.getByPlaceholderText('Filter by Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });
  });

  describe('Dispatches filter on Search click', () => {
    it('should dispatch setFilterText when typing and clicking Search', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PostFilter />);

      // Act
      await user.type(screen.getByPlaceholderText('Filter by Name'), 'hello');
      await user.click(screen.getByRole('button', { name: 'Search' }));

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'posts/setFilterText', payload: 'hello' }),
      );
    });
  });

  describe('Dispatches filter on Enter', () => {
    it('should dispatch setFilterText when pressing Enter', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PostFilter />);

      // Act
      await user.type(screen.getByPlaceholderText('Filter by Name'), 'hello{Enter}');

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'posts/setFilterText', payload: 'hello' }),
      );
    });
  });

  describe('Clears filter with empty input', () => {
    it('should dispatch clearFilter when input is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PostFilter />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Search' }));

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'posts/clearFilter' }),
      );
    });
  });
});
