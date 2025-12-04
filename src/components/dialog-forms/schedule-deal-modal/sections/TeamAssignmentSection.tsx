import type { ChangeEvent } from "react";
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
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Team & Assignment
      </h3>
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Salesperson</span>
          <select
            name="salesperson"
            value={form.salesperson}
            onChange={onInputChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            <option value="">Select salesperson</option>
            {salespersonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Project manager</span>
          <select
            name="projectManager"
            value={form.projectManager}
            onChange={onInputChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            <option value="">Select project manager</option>
            <option value="none">No project manager</option>
            {projectManagerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <input
          type="checkbox"
          name="disableDrips"
          checked={form.disableDrips}
          onChange={onInputChange}
          className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
        />
        Disable drips for this deal
      </label>
    </section>
  );
}
