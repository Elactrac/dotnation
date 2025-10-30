import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { trackError, addBreadcrumb } from '../utils/sentry';

/**
 * Default fallback component for page errors
 */
const DefaultFallback = ({ error, onReset, onReload, pageName, onRetry, showReload }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-3xl mx-auto"
    >
      <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                {pageName} Error
              </h2>
              <p className="text-red-700 mb-4">
                Something went wrong while loading {pageName.toLowerCase()}.
              </p>
              {error?.message && (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-red-200">
                  <p className="text-sm text-red-800 font-mono">{error.message}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors border-2 border-blue-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Action
                  </button>
                )}
                {showReload && (
                  <button
                    onClick={onReload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors border-2 border-gray-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

DefaultFallback.propTypes = {
  error: PropTypes.object,
  onReset: PropTypes.func,
  onReload: PropTypes.func,
  pageName: PropTypes.string,
  onRetry: PropTypes.func,
  showReload: PropTypes.bool,
};

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

  const WrappedFallback = (fallbackProps) => {
    if (FallbackComponent) {
      return <FallbackComponent {...fallbackProps} />;
    }
    return <DefaultFallback {...fallbackProps} pageName={pageName} onRetry={onRetry} showReload={showReload} />;
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={WrappedFallback}
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

export default PageErrorBoundary;