import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { postsApi } from '@features/posts/api/postsApi';
import postsReducer from '@features/posts/slices/postsSlice';

export function renderWithProviders(
  ui: React.ReactElement,
  renderOptions: RenderOptions = {},
) {
  const store = configureStore({
    reducer: {
      [postsApi.reducerPath]: postsApi.reducer,
      posts: postsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(postsApi.middleware),
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
