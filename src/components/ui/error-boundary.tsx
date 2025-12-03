import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Context label to help users understand where the error occurred */
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Store error info for potential debugging display
    this.setState({ errorInfo });

    // Log to console for debugging (could be replaced with error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          context={this.props.context}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback UI
interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  /** Context label to help users understand where the error occurred */
  context?: string;
}

/**
 * Get a user-friendly error message from technical error messages
 */
function getUserFriendlyMessage(error: Error | null): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Chunk loading errors (common in SPAs)
  if (message.includes('loading chunk') || message.includes('loading css chunk')) {
    return 'Failed to load part of the application. This usually happens after an update. Please refresh the page.';
  }

  // Timeout errors
  if (message.includes('timeout')) {
    return 'The request took too long to complete. Please try again.';
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Your session may have expired. Please refresh the page or log in again.';
  }

  // Generic fallback - don't expose technical details to users
  if (message.includes('undefined') || message.includes('null') || message.includes('cannot read')) {
    return 'Something went wrong while loading this section. Please try again.';
  }

  // Return the original message if it seems user-friendly (not too technical)
  if (error.message.length < 100 && !message.includes('error:')) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function ErrorFallback({ error, onReset, context }: ErrorFallbackProps) {
  const userMessage = getUserFriendlyMessage(error);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          {context ? `Error loading ${context}` : 'Something went wrong'}
        </h2>
        <p className="text-slate-600 mb-6">
          {userMessage}
        </p>
        <div className="flex gap-3 justify-center">
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Try again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}

// Page-level error fallback with navigation
export function PageErrorFallback({ error, onReset, context }: ErrorFallbackProps) {
  const userMessage = getUserFriendlyMessage(error);

  // Check if this might be a chunk loading error (needs refresh)
  const isChunkError = error?.message?.toLowerCase().includes('chunk');

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {context ? `Error loading ${context}` : 'Oops! Something went wrong'}
        </h1>
        <p className="text-slate-600 mb-6">
          {userMessage}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {onReset && !isChunkError && (
            <button
              onClick={onReset}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Try again
            </button>
          )}
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Go back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isChunkError ? 'Refresh page' : 'Go to dashboard'}
          </button>
        </div>
        {!isChunkError && (
          <p className="mt-6 text-sm text-slate-500">
            If this problem persists, try refreshing the page or contact support.
          </p>
        )}
      </div>
    </div>
  );
}

// Route-level error boundary wrapper
interface RouteErrorBoundaryProps {
  children: ReactNode;
}

export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<PageErrorFallback error={null} />}
      onError={(error, errorInfo) => {
        // Log to your error tracking service (e.g., Sentry)
        console.error('Route error:', error);
        console.error('Error info:', errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
