import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Post, ApiSuccessResponse } from '../types/post.types';

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
  }),
});

export const { useGetPostsQuery } = postsApi;
