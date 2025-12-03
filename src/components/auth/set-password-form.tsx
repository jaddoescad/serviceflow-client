"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { updatePassword } from "@/services/auth";
import { Button, Input } from "@/components/ui/library";

const MIN_PASSWORD_LENGTH = 8;

type SetPasswordFormProps = {
  email: string;
  displayName?: string | null;
  onCompleted: () => void;
};

type FormState = {
  password: string;
  confirmPassword: string;
};

const defaultState: FormState = {
  password: "",
  confirmPassword: "",
};

export function SetPasswordForm({ email, displayName, onCompleted }: SetPasswordFormProps) {
  const supabase = useSupabaseBrowserClient();
  const [form, setForm] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updatePassword(supabase, { password });
      setForm(defaultState);
      onCompleted();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error ? submissionError.message : "Something went wrong while setting your password.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <header className="space-y-1">
        <p className="text-[12px] font-semibold text-slate-900">{displayName ? `Welcome, ${displayName}!` : "Welcome!"}</p>
        <p className="text-[11px] text-slate-500">Finish setting up your account by choosing a password.</p>
      </header>
      <Input
        label="Email"
        id="email"
        value={email}
        disabled
        readOnly
        className="bg-slate-100"
      />
      <Input
        label="New password"
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        disabled={isSubmitting}
        minLength={MIN_PASSWORD_LENGTH}
        hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
      />
      <Input
        label="Confirm password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
        disabled={isSubmitting}
        minLength={MIN_PASSWORD_LENGTH}
      />
      {error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-[12px] font-medium text-red-700">{error}</p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isSubmitting}
        loadingText="Saving…"
        className="rounded-full"
      >
        Create password
      </Button>
    </form>
  );
}
