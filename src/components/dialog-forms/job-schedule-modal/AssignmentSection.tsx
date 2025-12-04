import type { ChangeEvent } from "react";
import type { FormState } from "./types";

type AssignmentSectionProps = {
  form: FormState;
  projectManagerSelectOptions: { value: string; label: string }[];
  crewSelectOptions: { value: string; label: string }[];
  isLoadingCrews?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function AssignmentSection({
  form,
  projectManagerSelectOptions,
  crewSelectOptions,
  isLoadingCrews,
  onChange,
}: AssignmentSectionProps) {
  return (
    <section className="space-y-2">
      <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
        <span>Project Manager</span>
        <select
          name="projectManager"
          value={form.projectManager}
          onChange={onChange}
          className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none"
        >
          <option value="">Select a project manager...</option>
          {projectManagerSelectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
        <span>Crew</span>
        <select
          name="crewId"
          value={form.crewId}
          onChange={onChange}
          disabled={isLoadingCrews}
          className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
        >
          {isLoadingCrews ? (
            <option value="">Loading crews...</option>
          ) : (
            <>
              <option value="">Unassigned</option>
              {crewSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          )}
        </select>
      </label>
    </section>
  );
}
