import { Component, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Code,
} from '@chakra-ui/react';
import { trackError, addBreadcrumb } from '../utils/sentry';

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Add breadcrumb for debugging
    addBreadcrumb(
      `Error boundary caught error: ${error.message}`,
      'error_boundary',
      'error'
    );

    // Log error to console
    console.error('Error Boundary caught error:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send error to Sentry with React context
    trackError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorCount: this.state.errorCount + 1,
      },
      tags: {
        error_source: 'error_boundary',
        component: 'ErrorBoundary',
      },
    });

    // Log to custom error tracking if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Optionally reload the page if errors persist
    if (this.state.errorCount > 2) {
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
          onReset={this.handleReset}
          onReload={this.handleReload}
          showDetails={this.props.showDetails !== false}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  showDetails: PropTypes.bool,
};

/**
 * Error Fallback UI Component
 */
const ErrorFallback = ({ 
  error, 
  errorInfo, 
  errorCount, 
  onReset, 
  onReload,
  showDetails 
}) => {
  const [showStack, setShowStack] = useState(false);
  const bgColor = 'gray.50';
  const borderColor = 'red.200';

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="6xl" mb={4}>⚠️</Text>
          <Heading size="xl" mb={2}>
            Oops! Something went wrong
          </Heading>
          <Text fontSize="lg" color="gray.600">
            We&apos;re sorry for the inconvenience. The application encountered an error.
          </Text>
        </Box>

        {showDetails && error && (
          <Box
            p={4}
            bg={bgColor}
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Heading size="sm" mb={2}>
              Error Details
            </Heading>
            <Text fontSize="sm" color="red.600" fontWeight="bold">
              {error.toString()}
            </Text>
            
            {errorInfo && (
              <Box mt={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStack(!showStack)}
                >
                  {showStack ? 'Hide' : 'Show'} Stack Trace
                </Button>
                
                {showStack && (
                  <Code
                    display="block"
                    whiteSpace="pre-wrap"
                    fontSize="xs"
                    p={2}
                    mt={2}
                    maxH="300px"
                    overflowY="auto"
                  >
                    {errorInfo.componentStack}
                  </Code>
                )}
              </Box>
            )}
          </Box>
        )}

        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={onReset}
            width="full"
          >
            Try Again
          </Button>
          
          {errorCount > 1 && (
            <Button
              colorScheme="red"
              variant="outline"
              size="lg"
              onClick={onReload}
              width="full"
            >
              Reload Page
            </Button>
          )}
          
          <Button
            as="a"
            href="/"
            variant="ghost"
            size="md"
          >
            Return to Home
          </Button>
        </VStack>

        <Box 
          p={4} 
          bg="blue.50" 
          borderRadius="md"
        >
          <Heading size="xs" mb={2}>
            What can you do?
          </Heading>
          <VStack align="start" spacing={1} fontSize="sm">
            <Text>• Try refreshing the page</Text>
            <Text>• Check your internet connection</Text>
            <Text>• Make sure Polkadot.js extension is installed</Text>
            <Text>• Try connecting to a different network</Text>
            <Text>• Contact support if the problem persists</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  errorInfo: PropTypes.object,
  errorCount: PropTypes.number.isRequired,
  onReset: PropTypes.func.isRequired,
  onReload: PropTypes.func.isRequired,
  showDetails: PropTypes.bool.isRequired,
};

/**
 * Higher-order component to wrap components with error boundary
 */
// eslint-disable-next-line react-refresh/only-export-components
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
