import type { ChangeEvent } from "react";
import { Select } from "@/components/ui/library";
import type { FormState, MemberOption } from "../types";

type TeamAssignmentSectionProps = {
  form: FormState;
  salespersonOptions: MemberOption[];
  projectManagerOptions: MemberOption[];
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function TeamAssignmentSection({
  form,
  salespersonOptions,
  projectManagerOptions,
  onInputChange,
}: TeamAssignmentSectionProps) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-2.5 md:grid-cols-2">
        <Select
          name="salesperson"
          label="Salesperson"
          value={form.salesperson}
          onChange={onInputChange}
          size="md"
        >
          <option value="">Select salesperson</option>
          {salespersonOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
          {projectManagerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}
