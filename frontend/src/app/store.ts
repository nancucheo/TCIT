import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducer — will be replaced when feature slices are added
const placeholderReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    _placeholder: placeholderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
