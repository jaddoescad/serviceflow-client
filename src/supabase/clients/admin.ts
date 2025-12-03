import { createClient } from "@supabase/supabase-js";

const getServiceKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_KEY?.trim() ||
  null;

export function createSupabaseAdminClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const serviceKey = getServiceKey();

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
