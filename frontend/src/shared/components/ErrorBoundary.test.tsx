import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const ThrowingComponent = () => {
  throw new Error('Test error');
};

const GoodComponent = () => <p>Working</p>;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error occurs', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('should display an error alert when a child component throws', () => {
    // Arrange & Act
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should reset error state when "Try again" is clicked', () => {
    // Arrange
    let shouldThrow = true;
    const ConditionalComponent = () => {
      if (shouldThrow) throw new Error('Test error');
      return <p>Recovered</p>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalComponent />
      </ErrorBoundary>,
    );

    // Act
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    rerender(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('Working')).toBeInTheDocument();
  });
});
