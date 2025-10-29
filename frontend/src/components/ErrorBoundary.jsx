import { Component, useState } from 'react';
import PropTypes from 'prop-types';
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-6xl mb-4">⚠️</p>
          <h1 className="text-4xl font-bold font-display text-gray-100 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-gray-400 font-body">
            We&apos;re sorry for the inconvenience. The application encountered an error.
          </p>
        </div>

        {showDetails && error && (
          <div className="p-4 bg-gray-900/80 backdrop-blur-xl rounded-xl border-2 border-red-500/30">
            <h2 className="text-lg font-bold font-display text-gray-100 mb-2">
              Error Details
            </h2>
            <p className="text-sm text-red-400 font-mono font-semibold">
              {error.toString()}
            </p>
            
            {errorInfo && (
              <div className="mt-2">
                <button
                  className="px-3 py-1 text-sm text-gray-300 hover:text-gray-100 transition-colors font-body"
                  onClick={() => setShowStack(!showStack)}
                >
                  {showStack ? 'Hide' : 'Show'} Stack Trace
                </button>
                
                {showStack && (
                  <pre className="block whitespace-pre-wrap text-xs font-mono p-2 mt-2 max-h-[300px] overflow-y-auto bg-gray-800/50 rounded border border-gray-700">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-body font-bold rounded-xl hover:shadow-glow transition-all duration-200"
            onClick={onReset}
          >
            Try Again
          </button>
          
          {errorCount > 1 && (
            <button
              className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-2 border-red-500/30 font-body font-bold rounded-xl transition-all duration-200"
              onClick={onReload}
            >
              Reload Page
            </button>
          )}
          
          <a
            href="/"
            className="block text-center px-6 py-3 text-gray-300 hover:text-gray-100 font-body transition-colors"
          >
            Return to Home
          </a>
        </div>

        <div className="p-4 bg-blue-500/10 backdrop-blur-xl rounded-xl border border-blue-500/30">
          <h3 className="text-sm font-bold font-display text-gray-100 mb-2">
            What can you do?
          </h3>
          <div className="space-y-1 text-sm text-gray-300 font-body">
            <p>• Try refreshing the page</p>
            <p>• Check your internet connection</p>
            <p>• Make sure Polkadot.js extension is installed</p>
            <p>• Try connecting to a different network</p>
            <p>• Contact support if the problem persists</p>
          </div>
        </div>
      </div>
    </div>
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
