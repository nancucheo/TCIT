import React from 'react';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import Layout from '@shared/components/Layout';
import { ToastProvider } from '@shared/components/ToastContext';
import ToastContainer from '@shared/components/ToastContainer';
import PostFilter from '@features/posts/components/PostFilter';
import PostList from '@features/posts/components/PostList';
import PostForm from '@features/posts/components/PostForm';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Layout>
          <PostFilter />
          <PostList />
          <PostForm />
        </Layout>
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
