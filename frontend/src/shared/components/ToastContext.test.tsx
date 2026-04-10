import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

const TestConsumer: React.FC = () => {
  const { toasts, addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Test message', 'success')}>Add Toast</button>
      {toasts.map((t) => (
        <div key={t.id} data-testid="toast">
          {t.message} ({t.variant})
        </div>
      ))}
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addToast shows toast', () => {
    it('should display a toast when addToast is called', () => {
      // Arrange
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      // Act
      act(() => {
        screen.getByText('Add Toast').click();
      });

      // Assert
      expect(screen.getByTestId('toast')).toHaveTextContent('Test message (success)');
    });
  });

  describe('Auto-dismiss after timeout', () => {
    it('should remove toast after 3 seconds', () => {
      // Arrange
      render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>,
      );

      // Act
      act(() => {
        screen.getByText('Add Toast').click();
      });
      expect(screen.getByTestId('toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Assert
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });
  });
});
