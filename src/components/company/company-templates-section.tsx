"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CompanySettingsRecord } from "@/types/company";
import { updateCompanySettings } from "@/features/companies";
import {
  DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT,
  DEFAULT_PROPOSAL_TERMS_TEMPLATE_KEY,
  getProposalTermsTemplateByKey,
  PROPOSAL_TERMS_TEMPLATES,
} from "@/constants/proposal-terms";

type CompanyTemplatesSectionProps = {
  company: CompanySettingsRecord;
};

export function CompanyTemplatesSection({ company }: CompanyTemplatesSectionProps) {
  const navigate = useNavigate();
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    company.proposal_terms_template_key ?? DEFAULT_PROPOSAL_TERMS_TEMPLATE_KEY
  );
  const [content, setContent] = useState(
    company.proposal_terms_template_content ?? DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setSelectedTemplateKey(company.proposal_terms_template_key ?? DEFAULT_PROPOSAL_TERMS_TEMPLATE_KEY);
    setContent(company.proposal_terms_template_content ?? DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT);
  }, [company]);

  const activeTemplate = useMemo(
    () => getProposalTermsTemplateByKey(selectedTemplateKey),
    [selectedTemplateKey]
  );

  const handleTemplateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplateKey(event.target.value);
    const fallback = getProposalTermsTemplateByKey(event.target.value);
    if (fallback) {
      setContent(fallback.content);
    }
    setMessage(null);
  };

  const handleReset = () => {
    if (activeTemplate) {
      setContent(activeTemplate.content);
    }
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateCompanySettings(company.id, {
        name: company.name,
        proposal_terms_template_key: selectedTemplateKey,
        proposal_terms_template_content: content,
      });

      setMessage({ type: "success", text: "Template saved." });
      window.location.reload();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't save the template. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Terms & Conditions Template
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={selectedTemplateKey}
          onChange={handleTemplateChange}
          disabled={isSaving}
        >
          {PROPOSAL_TERMS_TEMPLATES.map((template) => (
            <option key={template.key} value={template.key}>
              {template.label}
            </option>
          ))}
        </select>
        <p className="text-[12px] text-slate-500">{activeTemplate?.description}</p>
      </div>

      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Template Content
      </label>
      <textarea
        className="h-48 w-full rounded-lg border border-slate-300 bg-white p-3 text-[13px] leading-relaxed text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isSaving}
        spellCheck={false}
      />

      <div className="flex flex-col gap-2 text-[12px] text-slate-500">
        <p>
          Customers will read this text each time they confirm a proposal. Use the dropdown and the
          textarea to keep the language up to date for your company.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset to template
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save Template"}
        </button>
      </div>

      {message ? (
        <p
          className={`text-[12px] font-semibold ${message.type === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
