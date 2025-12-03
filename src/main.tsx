import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CommunicationTemplateProvider } from './contexts/CommunicationTemplateContext';
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary, PageErrorFallback } from './components/ui/error-boundary';
import { toast } from './components/ui/toast';
import { getErrorMessage, isNetworkError, getNetworkErrorMessage, ApiError } from './lib/errors';
import App from './App';
import './styles/globals.css';

/**
 * Global mutation cache with automatic error handling
 * This ensures ALL mutations show user-friendly error messages via toast
 */
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    // Skip if the mutation has its own onError handler that handles the error display
    // Check if mutation options have a custom onError and meta.skipGlobalErrorHandler
    if (mutation.options.meta?.skipGlobalErrorHandler) {
      return;
    }

    // Get user-friendly error message
    let errorMessage: string;
    let errorTitle = 'Something went wrong';

    if (isNetworkError(error)) {
      errorTitle = 'Connection error';
      errorMessage = getNetworkErrorMessage();
    } else if (error instanceof ApiError) {
      // Use specific titles for common error types
      if (error.isAuthError()) {
        errorTitle = 'Authentication required';
      } else if (error.isForbiddenError()) {
        errorTitle = 'Access denied';
      } else if (error.isNotFoundError()) {
        errorTitle = 'Not found';
      } else if (error.isValidationError()) {
        errorTitle = 'Validation error';
      } else if (error.isServerError()) {
        errorTitle = 'Server error';
      }
      errorMessage = getErrorMessage(error);
    } else {
      errorMessage = getErrorMessage(error);
    }

    // Use custom title from mutation meta if provided
    if (mutation.options.meta?.errorTitle) {
      errorTitle = mutation.options.meta.errorTitle as string;
    }

    toast.error(errorTitle, errorMessage);
  },
});

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (reduces unnecessary refetches)
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on tab switch
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<PageErrorFallback error={null} />}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <CommunicationTemplateProvider>
                <App />
              </CommunicationTemplateProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
