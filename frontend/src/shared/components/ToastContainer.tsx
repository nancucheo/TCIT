import React from 'react';
import { Toast, ToastContainer as BootstrapToastContainer } from 'react-bootstrap';
import { useToast } from './ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <BootstrapToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          bg={toast.variant}
          onClose={() => removeToast(toast.id)}
          autohide
          delay={3000}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.variant === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'success' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      ))}
    </BootstrapToastContainer>
  );
};

export default ToastContainer;
