import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PostsState {
  filterText: string;
}

const initialState: PostsState = {
  filterText: '',
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFilterText: (state, action: PayloadAction<string>) => {
      state.filterText = action.payload;
    },
    clearFilter: (state) => {
      state.filterText = '';
    },
  },
});

export const { setFilterText, clearFilter } = postsSlice.actions;
export default postsSlice.reducer;
