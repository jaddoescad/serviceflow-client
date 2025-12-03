import { createSupabaseBrowserClient } from '@/supabase/clients/browser';
import { ApiError } from '@/lib/errors';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

// Cached session for non-hook contexts
let cachedAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export function getAccessToken(): string | null {
  return cachedAccessToken;
}

// ============================================================================
// Request Deduplication
// Prevents duplicate concurrent requests for the same resource
// ============================================================================

type InFlightRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

// Cache for in-flight requests - keyed by URL + method + body hash
const inFlightRequests = new Map<string, InFlightRequest<unknown>>();

// Deduplication window in ms - requests within this window will share the same promise
const DEDUP_WINDOW_MS = 100;

// Cleanup interval - remove stale entries every 5 seconds
const CLEANUP_INTERVAL_MS = 5000;

/**
 * Generate a cache key for request deduplication
 * Only GET requests are deduplicated by default
 */
function generateRequestKey(url: string, init: RequestInit): string | null {
  const method = (init.method ?? 'GET').toUpperCase();

  // Only deduplicate GET requests - mutations should always execute
  if (method !== 'GET') {
    return null;
  }

  return `${method}:${url}`;
}

/**
 * Cleanup expired entries from the in-flight cache
 */
function cleanupInFlightCache(): void {
  const now = Date.now();
  for (const [key, request] of inFlightRequests.entries()) {
    if (now - request.timestamp > DEDUP_WINDOW_MS) {
      inFlightRequests.delete(key);
    }
  }
}

// Run cleanup periodically
if (typeof window !== 'undefined') {
  setInterval(cleanupInFlightCache, CLEANUP_INTERVAL_MS);
}

/**
 * Build URL with query params
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}${searchParams.toString()}`;
  }

  return url;
}

/**
 * Execute the actual fetch request (internal, not deduplicated)
 */
async function executeRequest<T>(url: string, init: RequestInit, token: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...init.headers as Record<string, string>,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || `API request failed: ${response.statusText}`;
    throw new ApiError(message, response.status, response.statusText, errorData);
  }

  return response.json();
}

/**
 * Get a valid access token, using cache or fetching from Supabase
 */
async function getValidToken(accessToken: string | null): Promise<string> {
  let token = accessToken ?? cachedAccessToken;

  // Fallback: fetch session if no cached token (for non-React contexts)
  if (!token) {
    const supabase = createSupabaseBrowserClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }
    token = session?.access_token ?? null;
    if (token) {
      cachedAccessToken = token;
    }
  }

  if (!token) {
    throw new Error('No authentication token available. Please log in again.');
  }

  return token;
}

/**
 * Make an authenticated API request using cached token
 * Falls back to fetching session if no cached token available
 *
 * GET requests are automatically deduplicated - concurrent identical requests
 * within a 100ms window will share the same network request.
 */
async function makeRequest<T>(url: string, init: RequestInit, accessToken: string | null): Promise<T> {
  const token = await getValidToken(accessToken);

  // Check for request deduplication opportunity
  const cacheKey = generateRequestKey(url, init);

  if (cacheKey) {
    const existing = inFlightRequests.get(cacheKey);
    const now = Date.now();

    // Return existing in-flight request if within dedup window
    if (existing && (now - existing.timestamp) < DEDUP_WINDOW_MS) {
      return existing.promise as Promise<T>;
    }

    // Create new request and cache it
    const promise = executeRequest<T>(url, init, token);

    inFlightRequests.set(cacheKey, {
      promise,
      timestamp: now,
    });

    // Clean up after request completes (success or failure)
    promise.finally(() => {
      // Only delete if this is still the cached request
      const current = inFlightRequests.get(cacheKey);
      if (current?.promise === promise) {
        inFlightRequests.delete(cacheKey);
      }
    });

    return promise;
  }

  // Non-GET requests bypass deduplication
  return executeRequest<T>(url, init, token);
}

/**
 * Browser-only API client for Client Components
 * Automatically includes Supabase JWT token for authentication
 * Uses cached token when available for better performance
 *
 * For Server Components: Query Supabase directly instead
 */
export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  const url = buildUrl(endpoint, params);
  return makeRequest<T>(url, init, null);
}

/**
 * API client that uses a pre-fetched access token
 * More efficient for use within React components
 */
export async function apiClientWithToken<T>(
  endpoint: string,
  accessToken: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options;
  const url = buildUrl(endpoint, params);
  return makeRequest<T>(url, init, accessToken);
}
