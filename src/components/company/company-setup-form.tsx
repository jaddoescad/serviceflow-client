"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeWebsiteUrl } from "@/lib/urls";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { createOrganization, switchCurrentOrganization } from "@/features/companies";

interface CompanySetupFormProps {
  userId: string;
  email: string | null;
}

type CompanyFormState = {
  name: string;
  ownerFirstName: string;
  ownerLastName: string;
  employeeCount: string;
  phoneNumber: string;
  website: string;
};

const initialFormState: CompanyFormState = {
  name: "",
  ownerFirstName: "",
  ownerLastName: "",
  employeeCount: "",
  phoneNumber: "",
  website: "",
};

export function CompanySetupForm({ userId, email }: CompanySetupFormProps) {
  const navigate = useNavigate();
  const supabase = useSupabaseBrowserClient();
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedOwnerFirst = form.ownerFirstName.trim();
    const trimmedOwnerLast = form.ownerLastName.trim();
    const trimmedPhone = form.phoneNumber.trim();
    const parsedEmployeeCount = Number(form.employeeCount);

    if (!trimmedName || !trimmedOwnerFirst || !trimmedOwnerLast || !trimmedPhone) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!Number.isInteger(parsedEmployeeCount) || parsedEmployeeCount < 0) {
      setError("Number of employees must be a non-negative whole number.");
      return;
    }

    let normalizedWebsite: string | null = null;

    try {
      normalizedWebsite = normalizeWebsiteUrl(form.website);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    if (!email) {
      setError("We could not determine your sign-up email. Please sign out and try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newOrg = await createOrganization(userId, {
        email,
        name: trimmedName,
        owner_first_name: trimmedOwnerFirst,
        owner_last_name: trimmedOwnerLast,
        employee_count: parsedEmployeeCount,
        phone_number: trimmedPhone,
        website: normalizedWebsite,
      });

      try {
        await switchCurrentOrganization(userId, newOrg.id);
        navigate("/");
        window.location.reload();
      } catch (switchError) {
        console.error("Failed to switch organization:", switchError);
        window.location.reload();
      }

    } catch (insertError) {
      setError(
        insertError instanceof Error
          ? insertError.message
          : "Could not save organization information."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-slate-900">Create your organization</h1>
          <p className="text-xs text-slate-600">Set up your organization to start using the CRM.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700" htmlFor="name">
            Company name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="organization"
            placeholder="Painter Pros LLC"
            value={form.name}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700" htmlFor="ownerFirstName">
              Owner first name
            </label>
            <input
              id="ownerFirstName"
              name="ownerFirstName"
              type="text"
              autoComplete="given-name"
              placeholder="Jordan"
              value={form.ownerFirstName}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700" htmlFor="ownerLastName">
              Owner last name
            </label>
            <input
              id="ownerLastName"
              name="ownerLastName"
              type="text"
              autoComplete="family-name"
              placeholder="Smith"
              value={form.ownerLastName}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700" htmlFor="employeeCount">
              Number of employees
            </label>
            <input
              id="employeeCount"
              name="employeeCount"
              type="number"
              inputMode="numeric"
              min={0}
              pattern="[0-9]*"
              placeholder="8"
              value={form.employeeCount}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700" htmlFor="phoneNumber">
              Phone number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700" htmlFor="website">
            Company website (optional)
          </label>
          <input
            id="website"
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://painterpros.com"
            value={form.website}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700" htmlFor="email">
            Account email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email ?? ""}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        ) : null}
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create organization"}
        </button>
      </form>
    </div>
  );
}
