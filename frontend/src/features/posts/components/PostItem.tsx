import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useDeletePostMutation } from '../api/postsApi';
import { useToast } from '@shared/components/ToastContext';
import type { Post } from '../types/post.types';

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [deletePost, { isLoading }] = useDeletePostMutation();
  const { addToast } = useToast();

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap();
      addToast('Post deleted successfully', 'success');
    } catch {
      addToast('Failed to delete post', 'danger');
    }
  };

  return (
    <tr>
      <td>{post.name}</td>
      <td>{post.description}</td>
      <td>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? (
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Deleting...</span>
            </Spinner>
          ) : (
            'Delete'
          )}
        </Button>
      </td>
    </tr>
  );
};

export default PostItem;
