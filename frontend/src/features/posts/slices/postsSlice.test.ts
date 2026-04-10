import postsReducer, { setFilterText, clearFilter, selectFilterText } from './postsSlice';

describe('postsSlice', () => {
  describe('Initial state', () => {
    it('should have filterText as empty string', () => {
      // Arrange & Act
      const state = postsReducer(undefined, { type: 'unknown' });

      // Assert
      expect(state.filterText).toBe('');
    });
  });

  describe('setFilterText', () => {
    it('should update filterText with the provided value', () => {
      // Arrange
      const initialState = { filterText: '' };

      // Act
      const state = postsReducer(initialState, setFilterText('search term'));

      // Assert
      expect(state.filterText).toBe('search term');
    });
  });

  describe('clearFilter', () => {
    it('should reset filterText to empty string', () => {
      // Arrange
      const initialState = { filterText: 'existing filter' };

      // Act
      const state = postsReducer(initialState, clearFilter());

      // Assert
      expect(state.filterText).toBe('');
    });
  });

  describe('selectFilterText', () => {
    it('should return the filterText from state', () => {
      // Arrange
      const state = { posts: { filterText: 'test query' } };

      // Act & Assert
      expect(selectFilterText(state)).toBe('test query');
    });
  });
});
