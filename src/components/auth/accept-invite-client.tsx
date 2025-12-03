"use client";

import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthError, User } from "@supabase/supabase-js";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { completeInviteSession } from "@/services/auth";
import { parseInviteFragment, clearUrlFragment } from "@/lib/auth/invite-fragment";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { Button } from "@/components/ui/library";

const containerClass =
  "mx-auto w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-card";

type AcceptInviteState =
  | { status: "loading"; message: string }
  | { status: "needs-password"; user: User }
  | { status: "completed" }
  | { status: "error"; message: string; canRetry: boolean };

export function AcceptInviteClient() {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();
  const [state, setState] = useState<AcceptInviteState>({
    status: "loading",
    message: "Validating your invitation…",
  });

  const processInvite = useCallback(async () => {
    let fragmentCleared = false;

    try {
      setState({ status: "loading", message: "Validating your invitation…" });

      if (typeof window === "undefined") {
        return;
      }

      const fragmentPayload = parseInviteFragment(window.location.hash);

      if (!fragmentPayload) {
        setState({
          status: "error",
          message: "This invite link is invalid or has already been used.",
          canRetry: false,
        });
        return;
      }

      if (fragmentPayload.type && fragmentPayload.type !== "invite") {
        setState({
          status: "error",
          message: "This link is not an invite. Try signing in or requesting a new invitation.",
          canRetry: false,
        });
        return;
      }

      await completeInviteSession(supabase, {
        accessToken: fragmentPayload.accessToken,
        refreshToken: fragmentPayload.refreshToken,
      });

      clearUrlFragment();
      fragmentCleared = true;

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!data?.user || !data.user.email) {
        setState({
          status: "error",
          message: "We could not locate the invited account. Request a new invite to continue.",
          canRetry: false,
        });
        return;
      }

      setState({ status: "needs-password", user: data.user });
    } catch (error) {
      const message =
        (error as AuthError)?.message ?? "We could not activate this invite. Request a new invite to continue.";
      setState({ status: "error", message, canRetry: !fragmentCleared });
    }
  }, [supabase]);

  useEffect(() => {
    void processInvite();
  }, [processInvite]);

  const handlePasswordCompleted = useCallback(async () => {
    setState({ status: "completed" });
    navigate("/", { replace: true });
    window.location.reload();
  }, [navigate]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={containerClass}>
          <p className="text-sm font-medium text-slate-600">{state.message}</p>
        </div>
      </div>
    );
  }

  if (state.status === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={containerClass}>
          <p className="text-sm font-semibold text-slate-900">All set!</p>
          <p className="text-[11px] text-slate-500">Redirecting you to your workspace…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={containerClass}>
          <p className="text-sm font-semibold text-red-600">We couldn&apos;t activate your invite.</p>
          <p className="text-[11px] text-slate-600">{state.message}</p>
          <div className="flex flex-col gap-2 pt-3">
            {state.canRetry ? (
              <Button
                variant="primary"
                onClick={() => void processInvite()}
                className="rounded-full"
              >
                Try again
              </Button>
            ) : null}
            <a
              href="mailto:support@serviceflow.com?subject=Invite%20help"
              className="text-center text-[11px] font-semibold text-accent hover:text-blue-500"
            >
              Request a new invite
            </a>
            <Link to="/" className="text-center text-[11px] font-semibold text-slate-600 hover:text-slate-800">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className={containerClass}>
        <SetPasswordForm
          email={state.user.email ?? ""}
          displayName={(state.user.user_metadata as { display_name?: string })?.display_name ?? null}
          onCompleted={() => {
            void handlePasswordCompleted();
          }}
        />
      </div>
    </div>
  );
}
