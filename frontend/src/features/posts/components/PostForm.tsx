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
    .min(1, 'El nombre es obligatorio')
    .max(255, 'El nombre no debe exceder 255 caracteres')
    .trim(),
  description: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .max(2000, 'La descripción no debe exceder 2000 caracteres'),
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
      addToast('Post creado exitosamente', 'success');
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
        addToast('Ocurrió un error inesperado', 'danger');
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
              placeholder="Nombre"
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
              placeholder="Descripción"
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
                <span className="visually-hidden">Creando...</span>
              </Spinner>
            ) : (
              'Crear'
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default PostForm;
