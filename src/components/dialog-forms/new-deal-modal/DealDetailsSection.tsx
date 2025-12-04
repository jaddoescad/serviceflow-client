import type { ChangeEvent } from "react";
import type { DealStageOption } from "@/features/deals";
import type { FormState } from "./types";

type DealDetailsSectionProps = {
  form: FormState;
  stages: DealStageOption[];
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function DealDetailsSection({
  form,
  stages,
  onInputChange,
}: DealDetailsSectionProps) {
  return (
    <section className="space-y-3">
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
    </section>
  );
}
