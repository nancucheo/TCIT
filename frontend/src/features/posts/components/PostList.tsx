import React from 'react';
import { Table, Alert } from 'react-bootstrap';
import { useGetPostsQuery } from '../api/postsApi';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const PostList: React.FC = () => {
  const { data: posts, isLoading, isError } = useGetPostsQuery();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <Alert variant="danger">Error loading posts</Alert>;
  if (!posts?.length) return <Alert variant="info">No posts found</Alert>;

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr key={post.id}>
            <td>{post.name}</td>
            <td>{post.description}</td>
            <td>{/* Delete button — future spec */}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default PostList;
