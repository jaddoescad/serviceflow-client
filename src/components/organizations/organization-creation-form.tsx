"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeWebsiteUrl } from "@/lib/urls";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { createOrganization } from "@/features/companies";
import { Button, Input } from "@/components/ui/library";

interface OrganizationCreationFormProps {
  userId: string;
  userEmail: string | null;
}

type FormState = {
  name: string;
  ownerFirstName: string;
  ownerLastName: string;
  employeeCount: string;
  phoneNumber: string;
  website: string;
};

const initialFormState: FormState = {
  name: "",
  ownerFirstName: "",
  ownerLastName: "",
  employeeCount: "",
  phoneNumber: "",
  website: "",
};

export function OrganizationCreationForm({ userId, userEmail }: OrganizationCreationFormProps) {
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

    if (!userEmail) {
      setError("We could not determine your email. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createOrganization(userId, {
        email: userEmail,
        name: trimmedName,
        owner_first_name: trimmedOwnerFirst,
        owner_last_name: trimmedOwnerLast,
        employee_count: parsedEmployeeCount,
        phone_number: trimmedPhone,
        website: normalizedWebsite,
      });

      navigate("/");
      window.location.reload();
    } catch (insertError) {
      setError(
        insertError instanceof Error
          ? insertError.message
          : "Could not create organization."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-slate-900">Create Organization</h2>
          <p className="text-xs text-slate-600">Set up your organization to get started.</p>
        </div>

        <Input
          label="Organization name"
          id="name"
          name="name"
          type="text"
          autoComplete="organization"
          placeholder="Acme Corp"
          value={form.name}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Owner first name"
            id="ownerFirstName"
            name="ownerFirstName"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            value={form.ownerFirstName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <Input
            label="Owner last name"
            id="ownerLastName"
            name="ownerLastName"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            value={form.ownerLastName}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Number of employees"
            id="employeeCount"
            name="employeeCount"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="10"
            value={form.employeeCount}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <Input
            label="Phone number"
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={form.phoneNumber}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <Input
          label="Company website (optional)"
          id="website"
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="https://acmecorp.com"
          value={form.website}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        {error ? (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          loadingText="Creating..."
          className="rounded-full"
        >
          Create Organization
        </Button>
      </form>
    </div>
  );
}
