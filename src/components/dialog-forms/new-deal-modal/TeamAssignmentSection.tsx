import type { ChangeEvent } from "react";
import type { CompanyMemberRecord } from "@/features/companies";
import { Select } from "@/components/ui/library";
import type { FormState } from "./types";

type TeamAssignmentSectionProps = {
  form: FormState;
  memberOptions: {
    sales: CompanyMemberRecord[];
    project: CompanyMemberRecord[];
  };
  dealSources: string[];
  isLoadingDealSources: boolean;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function TeamAssignmentSection({
  form,
  memberOptions,
  dealSources,
  isLoadingDealSources,
  onInputChange,
}: TeamAssignmentSectionProps) {
  return (
    <section className="space-y-3">
      <div className="grid gap-2.5 md:grid-cols-2">
        <Select
          name="salesperson"
          label="Salesperson"
          value={form.salesperson}
          onChange={onInputChange}
          size="md"
        >
          <option value="">Select salesperson</option>
          {form.salesperson &&
            !memberOptions.sales.some((member) => member.display_name === form.salesperson) ? (
            <option value={form.salesperson}>{form.salesperson}</option>
          ) : null}
          {memberOptions.sales.map((member) => (
            <option key={member.id} value={member.display_name}>
              {member.display_name}
            </option>
          ))}
        </Select>
        <Select
          name="projectManager"
          label="Project manager"
          value={form.projectManager}
          onChange={onInputChange}
          size="md"
        >
          <option value="">Select project manager</option>
          <option value="none">No project manager</option>
          {form.projectManager && form.projectManager !== "none" &&
            !memberOptions.project.some((member) => member.display_name === form.projectManager) ? (
            <option value={form.projectManager}>{form.projectManager}</option>
          ) : null}
          {memberOptions.project.map((member) => (
            <option key={member.id} value={member.display_name}>
              {member.display_name}
            </option>
          ))}
        </Select>
      </div>
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
