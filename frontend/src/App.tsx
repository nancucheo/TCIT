import React from 'react';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import Layout from '@shared/components/Layout';
import { ToastProvider } from '@shared/components/ToastContext';
import ToastContainer from '@shared/components/ToastContainer';
import PostForm from '@features/posts/components/PostForm';
import PostList from '@features/posts/components/PostList';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Layout>
          <PostForm />
          <PostList />
        </Layout>
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
