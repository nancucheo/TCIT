import React, { Component, ErrorInfo } from 'react';
import { Alert, Button } from 'react-bootstrap';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Algo salió mal</Alert.Heading>
          <p>Ocurrió un error inesperado.</p>
          <Button variant="outline-danger" onClick={this.handleReset}>
            Intentar de nuevo
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
