"use client";

import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/supabase/clients/browser";
import type { SupabaseBrowserClient } from "@/supabase/clients/browser";

export function useSupabaseBrowserClient(): SupabaseBrowserClient {
  return useMemo(() => createSupabaseBrowserClient(), []);
}

