import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '@features/posts/api/postsApi';
import postsReducer from '@features/posts/slices/postsSlice';

export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
    posts: postsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
