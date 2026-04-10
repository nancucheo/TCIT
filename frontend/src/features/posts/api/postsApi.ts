import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post, CreatePostDto, ApiSuccessResponse } from '../types/post.types';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      transformResponse: (response: ApiSuccessResponse<Post[]>) => response.data,
      providesTags: ['Posts'],
    }),
    createPost: builder.mutation<Post, CreatePostDto>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiSuccessResponse<Post>) => response.data,
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation<Post, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiSuccessResponse<Post>) => response.data,
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const { useGetPostsQuery, useCreatePostMutation, useDeletePostMutation } = postsApi;
