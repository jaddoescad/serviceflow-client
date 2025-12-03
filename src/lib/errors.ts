/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }

  /**
   * Check if the error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if the error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if the error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if the error is a forbidden error
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if the error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if the error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }
}

/**
 * Get a user-friendly error message from an error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Provide user-friendly messages for common HTTP errors
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'You need to log in to continue.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return error.message || 'The provided data is invalid.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'The server is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred.';
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch'))
  );
}

/**
 * Get a user-friendly message for network errors
 */
export function getNetworkErrorMessage(): string {
  return 'Unable to connect to the server. Please check your internet connection.';
}
