'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Alert, Button, VStack, Text } from '@chakra-ui/react';

interface ErrorBoundaryProps {
  /** Optional custom fallback UI rendered when an error is caught */
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render and lifecycle errors in its subtree, displaying a fallback UI
 * instead of crashing the entire page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console in development; swap for a monitoring service (e.g. Sentry) in production
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  reset(): void {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    return (
      <VStack align="stretch" gap={4} p={6} maxW="container.md" mx="auto">
        <Alert.Root status="error" borderRadius="md">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Something went wrong</Alert.Title>
            <Alert.Description>
              <Text>{'Something went wrong. Please refresh or try again later.'}</Text>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Button
          onClick={this.reset}
          colorPalette="red"
          variant="outline"
          alignSelf="flex-start"
          size="sm"
          aria-label="Reset error boundary and try again"
        >
          Try again
        </Button>
      </VStack>
    );
  }
}
