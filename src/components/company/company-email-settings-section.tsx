"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import type { CompanyEmailSettingsRecord } from "@/types/company-email-settings";
import { COMPANY_EMAIL_SETTINGS_DEFAULTS } from "@/constants/company-email-settings";
import { createCompanyEmailSettingsRepository } from "@/features/companies";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200";

const badgeClassByStatus: Record<string, string> = {
  connected: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700",
  disconnected: "bg-slate-100 text-slate-600",
};

type FormState = {
  replyEmail: string;
  bccEmail: string;
};

type CompanyEmailSettingsSectionProps = {
  companyId: string;
  initialSettings: CompanyEmailSettingsRecord | null;
};

function StatusBadge({ status }: { status: string }) {
  const normalized = status || "disconnected";
  const className = badgeClassByStatus[normalized] ?? badgeClassByStatus.disconnected;

  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${className}`}>
      {normalized === "connected"
        ? "Connected"
        : normalized === "error"
        ? "Action required"
        : "Disconnected"}
    </span>
  );
}

function ConnectionSummary({ settings }: { settings: CompanyEmailSettingsRecord }) {
  const replyDestination =
    settings.reply_email ?? settings.provider_account_email ?? "your default company email";
  const connectionDetail = settings.status_error?.trim();

  if (settings.status === "error") {
    const defaultErrorMessage = "We could not deliver the most recent emails. Confirm your Postmark API token and try again.";

    return (
      <p className="text-[12px] text-rose-600">
        {connectionDetail || defaultErrorMessage}
      </p>
    );
  }

  if (settings.status === "connected") {
    return (
      <p className="text-[12px] text-slate-600">
        Emails are sending via Postmark. Replies route to{" "}
        <span className="font-semibold">{replyDestination}</span>.
      </p>
    );
  }

  return (
    <p className="text-[12px] text-slate-600">
      ServiceFlow sends through Postmark. Set a Reply-To address below so recipients know where to respond.
    </p>
  );
}

export function CompanyEmailSettingsSection({
  companyId,
  initialSettings,
}: CompanyEmailSettingsSectionProps) {
  const [settings, setSettings] = useState<CompanyEmailSettingsRecord | null>(initialSettings);
  const [form, setForm] = useState<FormState>(() => ({
    replyEmail: initialSettings?.reply_email ?? "",
    bccEmail: initialSettings?.bcc_email ?? "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const emailSettingsRepository = useMemo(() => createCompanyEmailSettingsRepository(null), []);

  const effectiveSettings = useMemo(
    () => settings ?? { ...COMPANY_EMAIL_SETTINGS_DEFAULTS, company_id: companyId, id: "" },
    [settings, companyId]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const updatedSettings = await emailSettingsRepository.updateSettings(companyId, {
          reply_email: form.replyEmail || null,
          bcc_email: form.bccEmail || null,
        });

        setSettings(updatedSettings);
        setForm({
          replyEmail: updatedSettings.reply_email ?? "",
          bccEmail: updatedSettings.bcc_email ?? "",
        });
        setSuccess("Email preferences saved.");
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to save email settings."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyId, emailSettingsRepository, form]
  );

  return (
    <section id="email-settings" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Email Settings</h2>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-slate-700">Email delivery</p>
            <ConnectionSummary settings={effectiveSettings} />
          </div>
          <StatusBadge status={effectiveSettings.status} />
        </div>
        <p className="text-[12px] text-slate-500">
          Postmark is configured for your workspace. Update Reply-To and BCC addresses below to control
          how customers respond or how copies are routed.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="replyEmail">
              Reply-To Email
            </label>
            <input
              id="replyEmail"
              name="replyEmail"
              type="email"
              value={form.replyEmail}
              onChange={(event) =>
                setForm((current) => ({ ...current, replyEmail: event.target.value }))
              }
              placeholder="you@company.com"
              className={inputClass}
              disabled={isSubmitting}
              required
            />
            <p className="text-[11px] text-slate-500">
              We add this as the Reply-To header on every proposal email.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="bccEmail">
              BCC on Send (optional)
            </label>
            <input
              id="bccEmail"
              name="bccEmail"
              type="email"
              value={form.bccEmail}
              onChange={(event) =>
                setForm((current) => ({ ...current, bccEmail: event.target.value }))
              }
              placeholder="ops@company.com"
              className={inputClass}
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-slate-500">
              Useful for forwarding to CRM archives or shared inboxes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {error ? (
          <p className="text-[12px] font-semibold text-rose-600">{error}</p>
        ) : null}
        {success ? (
          <p className="text-[12px] font-semibold text-emerald-600">{success}</p>
        ) : null}
      </form>
    </section>
  );
}
