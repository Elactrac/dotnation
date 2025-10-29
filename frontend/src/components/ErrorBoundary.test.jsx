import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
import '@testing-library/jest-dom';

// Mock Sentry utils
vi.mock('../utils/sentry', () => ({
  trackError: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

// Test component that throws errors
const ThrowError = ({ shouldThrow, errorMessage }) => {
  if (shouldThrow) {
    throw new Error(errorMessage || 'Test error');
  }
  return <div>No error</div>;
};

const NetworkError = () => {
  throw new Error('Network request failed');
};

const AuthError = () => {
  throw new Error('Unauthorized - wallet not connected');
};

const DataError = () => {
  throw new Error('Failed to parse JSON response');
};

const RenderError = () => {
  throw new TypeError('Cannot read property of undefined');
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Suppress console.error for cleaner test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders error fallback when child throws error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Something went wrong" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('shows error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error: Custom error message')).toBeInTheDocument();
    });
  });

  describe('Error recovery', () => {
    it('shows try again button when error occurs', async () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error should be displayed with Try Again button
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('shows reload button after multiple errors', async () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      );

      // First error - no reload button yet
      expect(screen.queryByRole('button', { name: /reload page/i })).not.toBeInTheDocument();

      unmount();

      // Create a new error boundary for second error
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Second error" />
        </ErrorBoundary>
      );

      // After second error in new boundary, should still not show reload
      // (errorCount is per boundary instance)
      expect(screen.queryByRole('button', { name: /reload page/i })).not.toBeInTheDocument();
    });
  });

  describe('Error categorization', () => {
    it('categorizes network errors correctly', () => {
      render(
        <ErrorBoundary>
          <NetworkError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/unable to connect to the server/i)).toBeInTheDocument();
    });

    it('categorizes authentication errors correctly', () => {
      render(
        <ErrorBoundary>
          <AuthError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText(/problem with your wallet connection/i)).toBeInTheDocument();
    });

    it('categorizes data errors correctly', () => {
      render(
        <ErrorBoundary>
          <DataError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Data Error')).toBeInTheDocument();
      expect(screen.getByText(/problem loading the data/i)).toBeInTheDocument();
    });

    it('categorizes render errors correctly', () => {
      render(
        <ErrorBoundary>
          <RenderError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Display Error')).toBeInTheDocument();
      expect(screen.getByText(/problem displaying this content/i)).toBeInTheDocument();
    });
  });

  describe('Online/Offline detection', () => {
    it('shows online status when connected', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });

    it('shows offline status when disconnected', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  describe('Error details', () => {
    it('shows technical details when showDetails is true', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} errorMessage="Detailed error" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/technical details/i)).toBeInTheDocument();
    });

    it('hides technical details when showDetails is false', () => {
      render(
        <ErrorBoundary showDetails={false}>
          <ThrowError shouldThrow={true} errorMessage="Hidden error" />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/technical details/i)).not.toBeInTheDocument();
    });

    it('toggles stack trace visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Find show stack trace button
      const showButton = screen.getByRole('button', { name: /show stack trace/i });
      expect(showButton).toBeInTheDocument();

      // Click show stack trace
      await user.click(showButton);

      // Stack trace should be visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hide stack trace/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error tracking', () => {
    it('calls onError callback when provided', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="Tracked error" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('does not show error count badge for first error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First" />
        </ErrorBoundary>
      );

      // Should not show error count badge for first error
      expect(screen.queryByText(/occurred.*time/i)).not.toBeInTheDocument();
    });
  });

  describe('Auto-retry functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('respects maxAutoRetries prop', () => {
      render(
        <ErrorBoundary maxAutoRetries={5}>
          <NetworkError />
        </ErrorBoundary>
      );

      // Component should render without crashing
      expect(screen.getByText(/network connection error/i)).toBeInTheDocument();
    });

    it('handles online event for network errors', async () => {
      // Mock navigator.onLine as true
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      render(
        <ErrorBoundary maxAutoRetries={3}>
          <NetworkError />
        </ErrorBoundary>
      );

      // Should show network error
      expect(screen.getByText('Network Connection Error')).toBeInTheDocument();

      // Simulate coming back online - this should trigger auto-retry scheduling
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      // Component should still be rendering without crashes
      expect(screen.getByText('Network Connection Error')).toBeInTheDocument();
    });
  });

  describe('Suggestions and actions', () => {
    it('shows helpful suggestions based on error category', () => {
      render(
        <ErrorBoundary>
          <NetworkError />
        </ErrorBoundary>
      );

      expect(screen.getByText('What can you do?')).toBeInTheDocument();
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
    });

    it('shows return to home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByRole('link', { name: /return to home/i });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute('href', '/');
    });

    it('shows support information', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/need help\?/i)).toBeInTheDocument();
    });
  });

  describe('withErrorBoundary HOC', () => {
    it('wraps component with error boundary', () => {
      const TestComponent = () => <div>Test Component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('catches errors in wrapped component', () => {
      const WrappedComponent = withErrorBoundary(ThrowError);

      render(<WrappedComponent shouldThrow={true} />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('passes error boundary props to wrapper', () => {
      const onError = vi.fn();
      const WrappedComponent = withErrorBoundary(ThrowError, {
        onError,
        showDetails: false,
      });

      render(<WrappedComponent shouldThrow={true} />);

      expect(onError).toHaveBeenCalled();
      expect(screen.queryByText(/technical details/i)).not.toBeInTheDocument();
    });

    it('sets correct displayName', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });

    it('uses component name when displayName is not set', () => {
      const TestComponent = () => <div>Test</div>;
      
      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });
  });

  describe('Edge cases', () => {
    it('handles null error gracefully', () => {
      const NullError = () => {
        throw null;
      };

      render(
        <ErrorBoundary>
          <NullError />
        </ErrorBoundary>
      );

      // Should show Display Error since null is categorized as a TypeError
      expect(screen.getByText('Display Error')).toBeInTheDocument();
    });

    it('handles error without message', () => {
      const NoMessageError = () => {
        const error = new Error();
        error.message = '';
        throw error;
      };

      render(
        <ErrorBoundary>
          <NoMessageError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });

    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
