import React, { useState } from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';
import { useAppDispatch } from '@app/hooks';
import { setFilterText, clearFilter } from '../slices/postsSlice';

const PostFilter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const dispatch = useAppDispatch();

  const handleSearch = () => {
    if (inputValue.trim()) {
      dispatch(setFilterText(inputValue));
    } else {
      dispatch(clearFilter());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <InputGroup className="mb-3">
      <Form.Control
        type="text"
        placeholder="Filter by Name"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button variant="outline-secondary" onClick={handleSearch}>
        Search
      </Button>
    </InputGroup>
  );
};

export default PostFilter;
