import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast';
import { ApiError, getErrorMessage, isNetworkError, getNetworkErrorMessage } from '@/lib/errors';

interface ErrorHandlerOptions {
  /** Custom title for the error toast */
  title?: string;
  /** Whether to show a toast notification (default: true) */
  showToast?: boolean;
  /** Custom message override */
  message?: string;
  /** Callback to run after handling the error */
  onError?: (error: unknown) => void;
}

/**
 * Hook for consistent error handling across the application
 */
export function useErrorHandler() {
  const toast = useToast();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const { title = 'Error', showToast = true, message, onError } = options;

      // Log error for debugging
      console.error('Error handled:', error);

      if (showToast) {
        let errorMessage = message;

        if (!errorMessage) {
          if (isNetworkError(error)) {
            errorMessage = getNetworkErrorMessage();
          } else {
            errorMessage = getErrorMessage(error);
          }
        }

        toast.error(title, errorMessage);
      }

      // Handle specific error types
      if (error instanceof ApiError) {
        // Redirect to login on auth errors
        if (error.isAuthError()) {
          // Give time for toast to show
          if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
          }
          redirectTimeoutRef.current = setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      }

      onError?.(error);
    },
    [toast]
  );

  return { handleError };
}

/**
 * Hook for handling mutation errors with success/error toasts
 */
export function useMutationErrorHandler() {
  const toast = useToast();
  const { handleError } = useErrorHandler();

  const onSuccess = useCallback(
    (message: string, title = 'Success') => {
      toast.success(title, message);
    },
    [toast]
  );

  const onError = useCallback(
    (error: unknown, options?: ErrorHandlerOptions) => {
      handleError(error, {
        title: 'Operation failed',
        ...options,
      });
    },
    [handleError]
  );

  return { onSuccess, onError, handleError };
}

/**
 * Create mutation options with error handling
 */
export function createMutationOptions<TData, TVariables>(
  options: {
    onSuccessMessage?: string;
    onSuccessTitle?: string;
    onErrorTitle?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: unknown) => void;
  } = {}
) {
  return {
    onSuccess: options.onSuccess,
    onError: options.onError,
    meta: {
      successMessage: options.onSuccessMessage,
      successTitle: options.onSuccessTitle,
      errorTitle: options.onErrorTitle,
    },
  };
}
