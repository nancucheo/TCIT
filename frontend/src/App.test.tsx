import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('@features/posts/components/PostList', () => ({
  default: () => <div data-testid="post-list">PostList</div>,
}));

describe('App', () => {
  it('should render the layout with title and PostList', () => {
    // Arrange & Act
    render(<App />);

    // Assert
    expect(screen.getByRole('heading', { name: 'TCIT Posts Manager' })).toBeInTheDocument();
    expect(screen.getByTestId('post-list')).toBeInTheDocument();
  });
});
