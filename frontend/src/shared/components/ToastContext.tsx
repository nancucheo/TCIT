import React, { createContext, useCallback, useContext, useReducer } from 'react';

export interface ToastNotification {
  id: string;
  message: string;
  variant: 'success' | 'danger' | 'warning';
}

interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (message: string, variant: ToastNotification['variant']) => void;
  removeToast: (id: string) => void;
}

type Action =
  | { type: 'ADD'; toast: ToastNotification }
  | { type: 'REMOVE'; id: string };

function toastReducer(state: ToastNotification[], action: Action): ToastNotification[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

let toastCounter = 0;

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastNotification['variant']) => {
      const id = `toast-${++toastCounter}`;
      dispatch({ type: 'ADD', toast: { id, message, variant } });
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
