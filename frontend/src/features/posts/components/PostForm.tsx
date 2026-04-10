import React from 'react';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePostMutation } from '../api/postsApi';
import { useToast } from '@shared/components/ToastContext';
import type { ApiErrorResponse } from '../types/post.types';

const createPostSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must not exceed 255 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must not exceed 2000 characters'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

const PostForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  const [createPost, { isLoading }] = useCreatePostMutation();
  const { addToast } = useToast();

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      await createPost(data).unwrap();
      reset();
      addToast('Post created successfully', 'success');
    } catch (err) {
      const error = err as { data?: ApiErrorResponse };
      if (error.data?.error?.code === 'VALIDATION_ERROR' && error.data.error.details) {
        error.data.error.details.forEach((detail) => {
          setError(detail.field as keyof CreatePostFormData, {
            message: detail.message,
          });
        });
      } else if (error.data?.error?.code === 'POST_ALREADY_EXISTS') {
        addToast(error.data.error.message, 'danger');
      } else {
        addToast('An unexpected error occurred', 'danger');
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
      <Row className="align-items-start">
        <Col md={4}>
          <Form.Group>
            <Form.Control
              {...register('name')}
              placeholder="Name"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group>
            <Form.Control
              {...register('description')}
              placeholder="Description"
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <Spinner animation="border" size="sm" role="status">
                <span className="visually-hidden">Creating...</span>
              </Spinner>
            ) : (
              'Create'
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default PostForm;
