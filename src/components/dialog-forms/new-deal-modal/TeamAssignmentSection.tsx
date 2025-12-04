import type { ChangeEvent } from "react";
import type { CompanyMemberRecord } from "@/features/companies";
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
      <div className="grid gap-2.5 md:grid-cols-2">
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
        </label>
        <label className="flex items-center gap-2 self-end cursor-pointer rounded border border-slate-200 bg-white px-3 py-2">
          <input
            type="checkbox"
            name="disableDrips"
            checked={form.disableDrips}
            onChange={onInputChange}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[12px] font-medium text-slate-700">Disable drips</span>
        </label>
      </div>
    </section>
  );
}
