import { createSupabaseBrowserClient } from "@/supabase/clients/browser";
import type { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, SupabaseClient } from "@supabase/supabase-js";

const defaultSupabase = createSupabaseBrowserClient();

export const signInWithPassword = async (
    supabase: SupabaseClient, 
    credentials: SignInWithPasswordCredentials
) => {
  const client = supabase || defaultSupabase;
  return client.auth.signInWithPassword(credentials);
};

export const signUpWithPassword = async (
    supabase: SupabaseClient,
    credentials: SignUpWithPasswordCredentials
) => {
  const client = supabase || defaultSupabase;
  const { data, error } = await client.auth.signUp(credentials);
  if (error) throw error;
  
  return { 
      hasSession: !!data.session,
      data,
      error 
  };
};

export const signOut = async (supabase?: SupabaseClient) => {
  const client = supabase || defaultSupabase;
  return client.auth.signOut();
};

export const updatePassword = async (
    supabase: SupabaseClient,
    data: { password: string }
) => {
  const client = supabase || defaultSupabase;
  return client.auth.updateUser({ password: data.password });
};

export const completeInviteSession = async (
    supabase: SupabaseClient, 
    tokens: { accessToken: string | null; refreshToken: string | null }
) => {
  if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Missing tokens");
  }
  return supabase.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
  });
};
