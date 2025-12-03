import type { ChangeEvent } from "react";
import type { CompanyMemberRecord } from "@/features/companies";
import type { FormState } from "./types";

type TeamAssignmentSectionProps = {
  form: FormState;
  memberOptions: {
    sales: CompanyMemberRecord[];
    project: CompanyMemberRecord[];
  };
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function TeamAssignmentSection({
  form,
  memberOptions,
  onInputChange,
}: TeamAssignmentSectionProps) {
  return (
    <section className="space-y-3">
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
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
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
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Project manager</span>
          <select
            name="projectManager"
            value={form.projectManager}
            onChange={onInputChange}
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
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
          </select>
        </label>
      </div>
      <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-slate-700">Disable drips for this deal</span>
          <span className="text-[10px] text-slate-500">
            Turn off automation so this deal never enters the stage drip sequences.
          </span>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="disableDrips"
            className="peer sr-only"
            checked={form.disableDrips}
            onChange={onInputChange}
          />
          <div className="h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-blue-600" />
          <div className="absolute left-1 top-[4px] h-3.5 w-3.5 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
        </label>
      </div>
    </section>
  );
}
