import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import type { AuthError } from "@supabase/supabase-js";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const resetPasswordKeys = {
  session: ["resetPassword", "session"] as const,
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const supabase = useSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: isValidSession, isLoading: isCheckingSession } = useQuery({
    queryKey: resetPasswordKeys.session,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    staleTime: Infinity,
    retry: false,
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        throw updateError;
      }
    },
    onSuccess: () => {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    updatePasswordMutation.mutate(password);
  };

  const error = validationError ?? (updatePasswordMutation.error as AuthError)?.message ?? null;

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60";

  const primaryButtonClass =
    "inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70";

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-sm text-slate-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button onClick={() => navigate("/login")} className={primaryButtonClass}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (updatePasswordMutation.isSuccess) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Password Updated!</h1>
          <p className="text-sm text-slate-600">
            Your password has been successfully updated. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-semibold text-slate-900">Set New Password</h1>
          <p className="text-sm text-slate-600">Enter your new password below.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={updatePasswordMutation.isPending}
              minLength={6}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={updatePasswordMutation.isPending}
              minLength={6}
              required
              className={inputClass}
            />
          </div>
          {error ? (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
          ) : null}
          <button type="submit" disabled={updatePasswordMutation.isPending} className={primaryButtonClass}>
            {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
