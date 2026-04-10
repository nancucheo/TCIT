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
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>An unexpected error occurred.</p>
          <Button variant="outline-danger" onClick={this.handleReset}>
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
