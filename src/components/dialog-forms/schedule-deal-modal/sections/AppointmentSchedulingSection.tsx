import type { ChangeEvent } from "react";
import type { FormState, MemberOption } from "../types";
import { TIME_OPTIONS } from "../constants";

type AppointmentSchedulingSectionProps = {
  form: FormState;
  assignmentOptions: MemberOption[];
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function AppointmentSchedulingSection({
  form,
  assignmentOptions,
  onInputChange,
}: AppointmentSchedulingSectionProps) {
  return (
    <section className="space-y-2.5 border-b border-slate-200 pb-4">
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Scheduled date</span>
          <input
            type="date"
            name="scheduledDate"
            value={form.scheduledDate}
            onChange={onInputChange}
            required
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Assign appointment to</span>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={onInputChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            <option value="">Unassigned</option>
            {assignmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Start time</span>
          <select
            name="startTime"
            value={form.startTime}
            onChange={onInputChange}
            required
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            {TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>End time</span>
          <select
            name="endTime"
            value={form.endTime}
            onChange={onInputChange}
            required
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            {TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
