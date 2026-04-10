import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';
import { usePostFilter } from './usePostFilter';
import postsReducer, { setFilterText } from '../slices/postsSlice';
import type { Post } from '../types/post.types';

function createStore(initialFilterText = '') {
  const store = configureStore({
    reducer: { posts: postsReducer },
    preloadedState: { posts: { filterText: initialFilterText } },
  });
  return store;
}

function createWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

const makePosts = (names: string[]): Post[] =>
  names.map((name, i) => ({
    id: i + 1,
    name,
    description: `Description ${i + 1}`,
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-10T10:00:00.000Z',
  }));

describe('usePostFilter', () => {
  describe('Returns all posts without filter', () => {
    it('should return all posts when filterText is empty', () => {
      const store = createStore('');
      const posts = makePosts(['Post 1', 'Post 2', 'Post 3']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(3);
    });
  });

  describe('Filters by name', () => {
    it('should return only matching posts', () => {
      const store = createStore('post 1');
      const posts = makePosts(['Post 1', 'Post 2', 'Other']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(1);
      expect(result.current[0].name).toBe('Post 1');
    });
  });

  describe('Case insensitive', () => {
    it('should match regardless of case', () => {
      const store = createStore('my post');
      const posts = makePosts(['My Post']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(1);
    });
  });

  describe('No matches', () => {
    it('should return empty array when no posts match', () => {
      const store = createStore('xyz');
      const posts = makePosts(['Post 1', 'Post 2', 'Post 3']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(0);
    });
  });

  describe('Posts undefined', () => {
    it('should return empty array for undefined posts', () => {
      const store = createStore('');
      const { result } = renderHook(() => usePostFilter(undefined), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(0);
    });
  });

  describe('Posts empty', () => {
    it('should return empty array for empty posts', () => {
      const store = createStore('');
      const { result } = renderHook(() => usePostFilter([]), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(0);
    });
  });

  describe('Whitespace-only filter', () => {
    it('should return all posts when filter is whitespace', () => {
      const store = createStore('  ');
      const posts = makePosts(['Post 1', 'Post 2', 'Post 3']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(3);
    });
  });

  describe('Substring match', () => {
    it('should match substring within name', () => {
      const store = createStore('script');
      const posts = makePosts(['TypeScript Tips']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(1);
    });
  });

  describe('Reacts to filter changes', () => {
    it('should update when filterText changes', () => {
      const store = createStore('');
      const posts = makePosts(['Post 1', 'Post 2']);
      const { result } = renderHook(() => usePostFilter(posts), {
        wrapper: createWrapper(store),
      });
      expect(result.current).toHaveLength(2);

      act(() => {
        store.dispatch(setFilterText('post 1'));
      });
      expect(result.current).toHaveLength(1);
    });
  });
});
