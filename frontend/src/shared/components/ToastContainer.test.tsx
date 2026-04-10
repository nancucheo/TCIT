import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToastContainer from './ToastContainer';

vi.mock('./ToastContext', () => ({
  useToast: () => ({
    toasts: [
      { id: '1', message: 'Success message', variant: 'success' },
      { id: '2', message: 'Error message', variant: 'danger' },
    ],
    removeToast: vi.fn(),
    addToast: vi.fn(),
  }),
}));

describe('ToastContainer', () => {
  it('should render toasts from context', () => {
    // Arrange & Act
    render(<ToastContainer />);

    // Assert
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should display correct headers for each variant', () => {
    // Arrange & Act
    render(<ToastContainer />);

    // Assert
    expect(screen.getByText('Éxito')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
