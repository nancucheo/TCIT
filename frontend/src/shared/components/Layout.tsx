import React from 'react';
import { Container } from 'react-bootstrap';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">TCIT Posts Manager</h1>
      {children}
    </Container>
  );
};

export default Layout;
