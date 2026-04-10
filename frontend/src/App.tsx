import React from 'react';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import Layout from '@shared/components/Layout';
import PostList from '@features/posts/components/PostList';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Layout>
        <PostList />
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
