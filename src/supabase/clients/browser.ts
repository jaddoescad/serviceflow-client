import { createBrowserClient } from '@supabase/ssr'

// Singleton instance - only create one client for the entire app
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    )
  }
  return browserClient
}

export type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient>
