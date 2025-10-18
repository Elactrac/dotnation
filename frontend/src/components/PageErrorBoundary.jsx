import PropTypes from 'prop-types';
import { ErrorBoundary } from './ErrorBoundary';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button } from '@chakra-ui/react';
import { trackError, addBreadcrumb } from '../utils/sentry';

/**
 * Page-level error boundary with page-specific recovery options
 */
export const PageErrorBoundary = ({
  children,
  pageName,
  fallback: FallbackComponent,
  onRetry,
  showReload = true,
  ...props
}) => {
  const handleError = (error, errorInfo) => {
    // Add breadcrumb for debugging
    addBreadcrumb(
      `Page error in ${pageName}: ${error.message}`,
      'page_error',
      'error'
    );

    console.error(`Error in ${pageName}:`, error, errorInfo);

    // Send error to Sentry with page context
    trackError(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        pageName,
        errorBoundary: 'page',
      },
      tags: {
        error_source: 'page_error_boundary',
        page: pageName,
      },
    });

    // Could send to analytics here
    if (window.gtag) {
      window.gtag('event', 'page_error', {
        page_name: pageName,
        error_message: error.message,
        error_stack: error.stack,
      });
    }
  };

  const DefaultFallback = ({ error, errorInfo, errorCount, onReset, onReload, showDetails }) => {
    return (
      <Box p={8} maxW="container.md" mx="auto">
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle mr={2}>
              {pageName} Error
            </AlertTitle>
            <AlertDescription>
              Something went wrong while loading {pageName.toLowerCase()}.
              {error?.message && (
                <Box mt={2} fontSize="sm" opacity={0.8}>
                  {error.message}
                </Box>
              )}
            </AlertDescription>
            <Box mt={4}>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={onReset}
                mr={2}
              >
                Try Again
              </Button>
              {onRetry && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={onRetry}
                >
                  Retry Action
                </Button>
              )}
              {showReload && (
                <Button
                  size="sm"
                  colorScheme="gray"
                  variant="outline"
                  onClick={onReload}
                  ml={2}
                >
                  Reload Page
                </Button>
              )}
            </Box>
          </Box>
        </Alert>
      </Box>
    );
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={FallbackComponent || DefaultFallback}
      {...props}
    >
      {children}
    </ErrorBoundary>
  );
};

PageErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  pageName: PropTypes.string.isRequired,
  fallback: PropTypes.elementType,
  onRetry: PropTypes.func,
  showReload: PropTypes.bool,
};

const DefaultFallbackPropTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  errorCount: PropTypes.number,
  onReset: PropTypes.func,
  onReload: PropTypes.func,
  showDetails: PropTypes.bool,
};

DefaultFallback.propTypes = DefaultFallbackPropTypes;

export default PageErrorBoundary;