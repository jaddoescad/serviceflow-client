import type { ChangeEvent } from "react";
import type { DealStageOption } from "@/features/deals";
import type { FormState } from "./types";

type DealDetailsSectionProps = {
  form: FormState;
  stages: DealStageOption[];
  dealSources: string[];
  isLoadingDealSources: boolean;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function DealDetailsSection({
  form,
  stages,
  dealSources,
  isLoadingDealSources,
  onInputChange,
}: DealDetailsSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Deal Details
      </h3>
      <div className="space-y-2.5">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Deal source</span>
          <select
            name="leadSource"
            value={form.leadSource}
            onChange={onInputChange}
            disabled={isLoadingDealSources}
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
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
          <span className="text-[10px] font-normal text-slate-500">
            Manage deal sources in Company Settings.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Pipeline stage</span>
          <select
            name="stage"
            value={form.stage}
            onChange={onInputChange}
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
