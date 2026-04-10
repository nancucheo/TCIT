import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('@features/posts/components/PostFilter', () => ({
  default: () => <div data-testid="post-filter">PostFilter</div>,
}));

vi.mock('@features/posts/components/PostList', () => ({
  default: () => <div data-testid="post-list">PostList</div>,
}));

vi.mock('@features/posts/components/PostForm', () => ({
  default: () => <div data-testid="post-form">PostForm</div>,
}));

describe('App', () => {
  it('should render the layout with title, PostFilter, PostList, and PostForm', () => {
    // Arrange & Act
    render(<App />);

    // Assert
    expect(screen.getByRole('heading', { name: 'TCIT Posts Manager' })).toBeInTheDocument();
    expect(screen.getByTestId('post-filter')).toBeInTheDocument();
    expect(screen.getByTestId('post-list')).toBeInTheDocument();
    expect(screen.getByTestId('post-form')).toBeInTheDocument();
  });
});
