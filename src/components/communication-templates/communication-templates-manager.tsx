"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { COMMUNICATION_TEMPLATE_DEFINITIONS, COMMUNICATION_TEMPLATE_KEYS } from "@/features/communications/constants";
import { upsertTemplate } from "@/features/communications";
import type {
  CommunicationTemplateKey,
  CommunicationTemplateSnapshot,
} from "@/types/communication-templates";
import { toCommunicationTemplateSnapshot } from "@/lib/communication-templates";

type CommunicationTemplatesManagerProps = {
  companyId: string;
  templates: CommunicationTemplateSnapshot[];
};

type TemplateFormState = {
  emailSubject: string;
  emailBody: string;
  smsBody: string;
};

export function CommunicationTemplatesManager({
  companyId,
  templates,
}: CommunicationTemplatesManagerProps) {
  // Repository removed in favor of direct service calls

  const [snapshotsByKey, setSnapshotsByKey] = useState(() => {
    const map = new Map<CommunicationTemplateKey, CommunicationTemplateSnapshot>();
    templates.forEach((template) => map.set(template.key, template));
    return map;
  });

  const defaultKey = COMMUNICATION_TEMPLATE_KEYS[0];
  const [selectedKey, setSelectedKey] = useState<CommunicationTemplateKey>(defaultKey);

  const selectedDefinition = COMMUNICATION_TEMPLATE_DEFINITIONS[selectedKey];
  const selectedSnapshot = snapshotsByKey.get(selectedKey) ?? toCommunicationTemplateSnapshot(selectedKey, null);

  const [form, setForm] = useState<TemplateFormState>(() => ({
    emailSubject: selectedSnapshot.emailSubject,
    emailBody: selectedSnapshot.emailBody,
    smsBody: selectedSnapshot.smsBody,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTemplateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as CommunicationTemplateKey;
    setSelectedKey(nextKey);

    const snapshot = snapshotsByKey.get(nextKey) ?? toCommunicationTemplateSnapshot(nextKey, null);
    setForm({
      emailSubject: snapshot.emailSubject,
      emailBody: snapshot.emailBody,
      smsBody: snapshot.smsBody,
    });

    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleResetToDefaults = () => {
    const definition = COMMUNICATION_TEMPLATE_DEFINITIONS[selectedKey];
    setForm({
      emailSubject: definition.defaultEmailSubject,
      emailBody: definition.defaultEmailBody,
      smsBody: definition.defaultSmsBody,
    });
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const snapshot: CommunicationTemplateSnapshot = {
        key: selectedKey,
        name: selectedDefinition.label,
        description: selectedDefinition.helpText,
        emailSubject: form.emailSubject,
        emailBody: form.emailBody,
        smsBody: form.smsBody,
        updatedAt: new Date().toISOString(),
      };

      await upsertTemplate({
        company_id: companyId,
        template_key: selectedKey,
        name: selectedDefinition.label,
        description: selectedDefinition.helpText,
        email_subject: form.emailSubject,
        email_body: form.emailBody,
        sms_body: form.smsBody,
      });

      setSnapshotsByKey((current) => {
        const next = new Map(current);
        next.set(selectedKey, snapshot);
        return next;
      });

      setSuccessMessage("Template saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save template."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={handleSubmit}>
      <section className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="templateKey">
            Template Type
          </label>
          <select
            id="templateKey"
            value={selectedKey}
            onChange={handleTemplateChange}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSaving}
          >
            {COMMUNICATION_TEMPLATE_KEYS.map((key) => {
              const definition = COMMUNICATION_TEMPLATE_DEFINITIONS[key];
              return (
                <option key={key} value={key}>
                  {definition.label}
                </option>
              );
            })}
          </select>
          <p className="text-[11px] text-slate-500">{selectedDefinition.helpText}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="emailSubject">
            Email Subject
          </label>
          <input
            id="emailSubject"
            name="emailSubject"
            value={form.emailSubject}
            onChange={handleFieldChange}
            placeholder="Proposal #{{quote_number}} from {{company_name}}"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="emailBody">
            Email Message
          </label>
          <textarea
            id="emailBody"
            name="emailBody"
            value={form.emailBody}
            onChange={handleFieldChange}
            rows={8}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSaving}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="smsBody">
            SMS Message
          </label>
          <textarea
            id="smsBody"
            name="smsBody"
            value={form.smsBody}
            onChange={handleFieldChange}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSaving}
          />
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
            <p className="font-semibold text-slate-800">Keywords (applies to email & SMS)</p>
            <p className="mt-1 flex flex-wrap gap-1">
              {selectedDefinition.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-md bg-white px-2 py-0.5 font-semibold text-[10px] text-slate-700 shadow-sm"
                >
                  {keyword}
                </span>
              ))}
            </p>
          </div>
        </div>

        {(successMessage || errorMessage) && (
          <p
            className={`text-[11px] ${successMessage ? "text-emerald-600" : "text-rose-600"}`}
          >
            {successMessage ?? errorMessage}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Template"}
          </button>
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            Reset to Defaults
          </button>
        </div>
      </section>
    </form>
  );
}
