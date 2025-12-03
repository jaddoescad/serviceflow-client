import type { ChangeEvent } from "react";
import type { FormState } from "../types";

type DealDetailsSectionProps = {
  form: FormState;
  dealSources: string[];
  isLoadingDealSources: boolean;
  stageLabel: string;
  isEditMode: boolean;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function DealDetailsSection({
  form,
  dealSources,
  isLoadingDealSources,
  stageLabel,
  isEditMode,
  onInputChange,
}: DealDetailsSectionProps) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Deal Details
      </h3>
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Deal source</span>
          <select
            name="leadSource"
            value={form.leadSource}
            onChange={onInputChange}
            disabled={isLoadingDealSources}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">Select a deal source</option>
            {form.leadSource && !dealSources.includes(form.leadSource) ? (
              <option value={form.leadSource}>{form.leadSource}</option>
            ) : null}
            {dealSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Pipeline stage</span>
          <input
            value={stageLabel}
            readOnly
            className="w-full cursor-not-allowed rounded border border-dashed border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[12px] text-slate-500"
          />
          <p className="text-[10px] font-normal text-slate-500">
            {isEditMode
              ? `Stage remains ${stageLabel} for edited appointments.`
              : `Stage updates to ${stageLabel} when you schedule this deal.`}
          </p>
        </div>
      </div>
    </section>
  );
}
