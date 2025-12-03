import type { ChangeEvent } from "react";
import type { FormState } from "../types";

type AppointmentNotesSectionProps = {
  form: FormState;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function AppointmentNotesSection({
  form,
  onInputChange,
}: AppointmentNotesSectionProps) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Appointment Notes
      </h3>
      <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
        <span>Internal notes</span>
        <textarea
          name="notes"
          value={form.notes}
          onChange={onInputChange}
          placeholder="Add any internal notes or instructions for this appointment"
          rows={3}
          className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
        />
      </label>
    </section>
  );
}
