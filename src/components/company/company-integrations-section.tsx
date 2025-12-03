"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { updateCompanyPhoneNumber } from "@/features/companies";
import { formatPhoneToE164 } from "@/lib/phone";

type CompanyIntegrationsSectionProps = {
  companyId: string;
  initialSmsNumber: string | null;
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200";

export function CompanyIntegrationsSection({
  companyId,
  initialSmsNumber,
}: CompanyIntegrationsSectionProps) {
  const navigate = useNavigate();
  const supabase = useSupabaseBrowserClient();
  const [smsNumber, setSmsNumber] = useState(initialSmsNumber ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSmsNumber(event.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const trimmed = smsNumber.trim();
    let formatted: string | null = null;

    if (trimmed) {
      formatted = formatPhoneToE164(trimmed);

      if (!formatted) {
        setError("Enter a valid SMS phone number in international format, such as +13433218872.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const updated = await updateCompanyPhoneNumber(companyId, formatted);
      setSmsNumber(updated ?? "");
      setSuccess("SMS number saved.");
      window.location.reload();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update the SMS number."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="integrations" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Integrations</h2>
          <p className="text-[12px] text-slate-500">
            Connect third-party services to unlock automations and syncing.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            SMS Routing
          </p>
          <p className="text-[12px] text-slate-500">
            Store your SMS number in international format so inbound replies map to this account.
          </p>
        </div>
        <div className="max-w-md space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="integrationsSmsNumber">
            SMS Number
          </label>
          <input
            id="integrationsSmsNumber"
            name="integrationsSmsNumber"
            value={smsNumber}
            onChange={handleChange}
            placeholder="+13433218872"
            className={inputClass}
            disabled={isSubmitting}
            inputMode="tel"
          />
          <p className="text-[11px] text-slate-500">
            We recommend the +E.164 format (e.g., +12223334444) to ensure inbound SMS routes correctly.
          </p>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Integrations"}
        </button>
        {error ? <p className="text-[12px] font-semibold text-rose-600">{error}</p> : null}
        {success ? <p className="text-[12px] font-semibold text-emerald-600">{success}</p> : null}
      </form>
    </section>
  );
}
