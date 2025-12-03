"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { signOut } from "@/services/auth";
import { Button } from "@/components/ui/library";

export function SignOutButton() {
  const navigate = useNavigate();
  const supabase = useSupabaseBrowserClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsSigningOut(true);
    setError(null);

    try {
      await signOut(supabase);
      window.location.reload();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Failed to sign out.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondary"
        onClick={handleClick}
        loading={isSigningOut}
        loadingText="Signing out..."
        className="rounded-full"
      >
        Sign out
      </Button>
      {error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
