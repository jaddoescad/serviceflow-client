"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCompanyContext } from "./AuthContext";
import { getCommunicationTemplateByKey } from "@/features/communications";
import type {
  CommunicationTemplateKey,
  CommunicationTemplateSnapshot,
} from "@/features/communications";

// ============================================================================
// Context Types
// ============================================================================

type TemplateCache = Map<CommunicationTemplateKey, CommunicationTemplateSnapshot>;

type CommunicationTemplateContextValue = {
  /**
   * Get a template from cache or fetch it if not cached
   * Returns null while loading, the snapshot once loaded
   */
  getTemplate: (key: CommunicationTemplateKey) => CommunicationTemplateSnapshot | null;

  /**
   * Force refresh a specific template from the API
   */
  refreshTemplate: (key: CommunicationTemplateKey) => Promise<CommunicationTemplateSnapshot | null>;

  /**
   * Check if a template is currently loading
   */
  isLoading: (key: CommunicationTemplateKey) => boolean;

  /**
   * Invalidate all cached templates (e.g., after updating templates)
   */
  invalidateAll: () => void;

  /**
   * Invalidate a specific template
   */
  invalidate: (key: CommunicationTemplateKey) => void;

  /**
   * Pre-fetch multiple templates at once
   */
  prefetchTemplates: (keys: CommunicationTemplateKey[]) => Promise<void>;
};

// ============================================================================
// Context Creation
// ============================================================================

const CommunicationTemplateContext = createContext<CommunicationTemplateContextValue | null>(null);

// ============================================================================
// Hook to use context
// ============================================================================

export function useCommunicationTemplateContext() {
  const context = useContext(CommunicationTemplateContext);
  if (!context) {
    throw new Error(
      "useCommunicationTemplateContext must be used within a CommunicationTemplateProvider"
    );
  }
  return context;
}

/**
 * Convenience hook to get a specific template with auto-fetch
 */
export function useCommunicationTemplate(key: CommunicationTemplateKey) {
  const { getTemplate, isLoading, refreshTemplate } = useCommunicationTemplateContext();

  return {
    template: getTemplate(key),
    isLoading: isLoading(key),
    refresh: () => refreshTemplate(key),
  };
}

// ============================================================================
// Provider Component
// ============================================================================

type CommunicationTemplateProviderProps = {
  children: ReactNode;
};

export function CommunicationTemplateProvider({ children }: CommunicationTemplateProviderProps) {
  const { company } = useCompanyContext();
  const companyId = company?.id;

  // Template cache - stores fetched templates
  const [cache, setCache] = useState<TemplateCache>(new Map());

  // Loading state - tracks which templates are currently being fetched
  const [loadingKeys, setLoadingKeys] = useState<Set<CommunicationTemplateKey>>(new Set());

  // Fetch promises cache - prevents duplicate in-flight requests
  const [fetchPromises] = useState<Map<CommunicationTemplateKey, Promise<CommunicationTemplateSnapshot | null>>>(new Map());

  // Check if template is loading
  const isLoading = useCallback(
    (key: CommunicationTemplateKey) => loadingKeys.has(key),
    [loadingKeys]
  );

  // Fetch a template from the API
  const fetchTemplate = useCallback(
    async (key: CommunicationTemplateKey): Promise<CommunicationTemplateSnapshot | null> => {
      if (!companyId) return null;

      // Check if there's already a pending request for this key
      const existingPromise = fetchPromises.get(key);
      if (existingPromise) {
        return existingPromise;
      }

      // Mark as loading
      setLoadingKeys((prev) => new Set(prev).add(key));

      // Create and store the fetch promise
      const promise = (async () => {
        try {
          const template = await getCommunicationTemplateByKey(companyId, key);

          // Update cache
          setCache((prev) => {
            const next = new Map(prev);
            next.set(key, template);
            return next;
          });

          return template;
        } catch (error) {
          console.error(`Failed to fetch communication template: ${key}`, error);
          return null;
        } finally {
          // Remove from loading state
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });

          // Remove from fetch promises
          fetchPromises.delete(key);
        }
      })();

      fetchPromises.set(key, promise);
      return promise;
    },
    [companyId, fetchPromises]
  );

  // Get template - returns cached version or triggers fetch
  const getTemplate = useCallback(
    (key: CommunicationTemplateKey): CommunicationTemplateSnapshot | null => {
      // Return cached template if available
      const cached = cache.get(key);
      if (cached) {
        return cached;
      }

      // If not loading, trigger a fetch (fire and forget)
      if (!loadingKeys.has(key) && companyId) {
        void fetchTemplate(key);
      }

      return null;
    },
    [cache, companyId, fetchTemplate, loadingKeys]
  );

  // Force refresh a template
  const refreshTemplate = useCallback(
    async (key: CommunicationTemplateKey): Promise<CommunicationTemplateSnapshot | null> => {
      // Clear cache for this key
      setCache((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });

      // Fetch fresh
      return fetchTemplate(key);
    },
    [fetchTemplate]
  );

  // Invalidate all templates
  const invalidateAll = useCallback(() => {
    setCache(new Map());
  }, []);

  // Invalidate specific template
  const invalidate = useCallback((key: CommunicationTemplateKey) => {
    setCache((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // Prefetch multiple templates
  const prefetchTemplates = useCallback(
    async (keys: CommunicationTemplateKey[]) => {
      const promises = keys.map((key) => {
        if (!cache.has(key) && !loadingKeys.has(key)) {
          return fetchTemplate(key);
        }
        return Promise.resolve(null);
      });

      await Promise.all(promises);
    },
    [cache, fetchTemplate, loadingKeys]
  );

  // Context value
  const contextValue = useMemo<CommunicationTemplateContextValue>(
    () => ({
      getTemplate,
      refreshTemplate,
      isLoading,
      invalidateAll,
      invalidate,
      prefetchTemplates,
    }),
    [getTemplate, refreshTemplate, isLoading, invalidateAll, invalidate, prefetchTemplates]
  );

  return (
    <CommunicationTemplateContext.Provider value={contextValue}>
      {children}
    </CommunicationTemplateContext.Provider>
  );
}
