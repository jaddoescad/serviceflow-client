import type { ChangeEvent } from "react";
import { Select } from "@/components/ui/library";
import type { FormState } from "../types";

type DealDetailsSectionProps = {
  form: FormState;
  dealSources: string[];
  isLoadingDealSources: boolean;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function DealDetailsSection({
  form,
  dealSources,
  isLoadingDealSources,
  onInputChange,
}: DealDetailsSectionProps) {
  return (
    <section className="space-y-2.5">
      <Select
        name="leadSource"
        label="Deal source"
        value={form.leadSource}
        onChange={onInputChange}
        disabled={isLoadingDealSources}
        size="md"
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
      </Select>
    </section>
  );
}
