import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Layout from './Layout';

describe('Layout', () => {
  it('should render the application title', () => {
    // Arrange & Act
    render(<Layout><div>child content</div></Layout>);

    // Assert
    expect(screen.getByRole('heading', { name: 'TCIT Posts Manager' })).toBeInTheDocument();
  });

  it('should render children', () => {
    // Arrange & Act
    render(<Layout><p>Test child</p></Layout>);

    // Assert
    expect(screen.getByText('Test child')).toBeInTheDocument();
  });
});
