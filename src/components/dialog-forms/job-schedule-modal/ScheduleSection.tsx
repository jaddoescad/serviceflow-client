import type { ChangeEvent } from "react";
import type { FormState } from "./types";

type ScheduleSectionProps = {
  form: FormState;
  stageLabel: string;
  timeOptions: { value: string; label: string }[];
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function ScheduleSection({
  form,
  stageLabel,
  timeOptions,
  onChange,
}: ScheduleSectionProps) {
  return (
    <section className="space-y-2">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Start Date</span>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>End Date</span>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Start Time</span>
          <select
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none"
            required
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>End Time</span>
          <select
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none"
            required
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="rounded border border-dashed border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
        Stage updates to <span className="font-semibold text-slate-700">{stageLabel}</span> when you save.
      </p>
    </section>
  );
}
