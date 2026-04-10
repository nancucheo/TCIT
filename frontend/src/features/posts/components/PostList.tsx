import React from 'react';
import { Table, Alert } from 'react-bootstrap';
import { useGetPostsQuery } from '../api/postsApi';
import { usePostFilter } from '../hooks/usePostFilter';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import PostItem from './PostItem';

const PostList: React.FC = () => {
  const { data: posts, isLoading, isError } = useGetPostsQuery();
  const filteredPosts = usePostFilter(posts);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <Alert variant="danger">Error al cargar posts</Alert>;
  if (!posts?.length) return <Alert variant="info">No se encontraron posts</Alert>;

  if (!filteredPosts.length) {
    return <Alert variant="info">Ningún post coincide con tu filtro</Alert>;
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {filteredPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </tbody>
    </Table>
  );
};

export default PostList;
