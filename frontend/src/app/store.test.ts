import { describe, it, expect } from 'vitest';
import { store } from './store';

describe('store', () => {
  it('should be configured with postsApi and posts reducers', () => {
    // Arrange & Act
    const state = store.getState();

    // Assert
    expect(state).toHaveProperty('postsApi');
    expect(state).toHaveProperty('posts');
    expect(state.posts).toEqual({ filterText: '' });
  });
});
