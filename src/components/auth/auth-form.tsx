"use client";

import { useState, useEffect, useRef } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import {
  signInWithPassword,
  signUpWithPassword,
} from "@/services/auth";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

const initialFormState = { email: "", password: "" };

export function AuthForm() {
  const supabase = useSupabaseBrowserClient();
  const [form, setForm] = useState(initialFormState);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const modeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (modeTimeoutRef.current) {
        clearTimeout(modeTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleMode = () => {
    setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();

    if (mode === "forgot-password") {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setInfo(null);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (resetError) {
          throw resetError;
        }

        setForm(initialFormState);
        setInfo("Password reset email sent. Check your inbox.");
        if (modeTimeoutRef.current) {
          clearTimeout(modeTimeoutRef.current);
        }
        modeTimeoutRef.current = setTimeout(() => setMode("sign-in"), 3000);
      } catch (authError) {
        const message = (authError as AuthError)?.message ?? "Failed to send reset email.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email || !password) {
      setError("Please enter both an email and password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "sign-in") {
        await signInWithPassword(supabase, { email, password });
        setForm(initialFormState);

        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Force a hard navigation to ensure server picks up the session
        window.location.href = "/organizations/select";
      } else {
        const { hasSession } = await signUpWithPassword(supabase, {
          email,
          password,
        });

        setForm(initialFormState);

        if (hasSession) {
          // Wait a bit for the session to be established
          await new Promise(resolve => setTimeout(resolve, 500));

          // Force a hard navigation to ensure server picks up the session
          window.location.href = "/organizations/select";
          return;
        }

        setInfo("Account created. Sign in after confirming your email.");
        setMode("sign-in");
      }
    } catch (authError) {
      const message = (authError as AuthError)?.message ?? "Something went wrong.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60";

  const primaryButtonClass =
    "inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70";

  const linkButtonClass =
    "text-sm font-semibold text-accent transition hover:text-blue-500 disabled:opacity-60";

  const getTitle = () => {
    if (mode === "forgot-password") return "Reset your password";
    if (mode === "sign-up") return "Create an account";
    return "Sign in";
  };

  const getButtonText = () => {
    if (isSubmitting) return "Working...";
    if (mode === "forgot-password") return "Send reset link";
    if (mode === "sign-up") return "Sign up";
    return "Sign in";
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">{getTitle()}</h1>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className={inputClass}
          />
        </div>
        {mode !== "forgot-password" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting}
              minLength={6}
              required
              className={inputClass}
            />
          </div>
        )}
        {mode === "sign-in" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setMode("forgot-password");
                setError(null);
                setInfo(null);
              }}
              disabled={isSubmitting}
              className="text-sm font-medium text-accent hover:text-blue-500"
            >
              Forgot password?
            </button>
          </div>
        )}
        {error ? (
          <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        ) : null}
        {info ? (
          <p className="rounded-xl bg-blue-100 px-4 py-3 text-sm font-medium text-blue-700">{info}</p>
        ) : null}
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {getButtonText()}
        </button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-center">
        {mode === "forgot-password" ? (
          <button
            type="button"
            className={linkButtonClass}
            onClick={() => {
              setMode("sign-in");
              setError(null);
              setInfo(null);
            }}
            disabled={isSubmitting}
          >
            Back to sign in
          </button>
        ) : (
          <button
            type="button"
            className={linkButtonClass}
            onClick={toggleMode}
            disabled={isSubmitting}
          >
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        )}
      </div>
    </div>
  );
}
