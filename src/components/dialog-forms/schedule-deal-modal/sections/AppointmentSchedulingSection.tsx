import type { ChangeEvent } from "react";
import { Input, Select } from "@/components/ui/library";
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
    <section className="space-y-2.5">
      <div className="grid gap-2.5 md:grid-cols-2">
        <Input
          type="date"
          name="scheduledDate"
          label="Scheduled date"
          value={form.scheduledDate}
          onChange={onInputChange}
          required
          size="md"
        />
        <Select
          name="assignedTo"
          label="Assign to"
          value={form.assignedTo}
          onChange={onInputChange}
          size="md"
        >
          <option value="">Unassigned</option>
          {assignmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-2.5 md:grid-cols-2">
        <Select
          name="startTime"
          label="Start time"
          value={form.startTime}
          onChange={onInputChange}
          required
          size="md"
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          name="endTime"
          label="End time"
          value={form.endTime}
          onChange={onInputChange}
          required
          size="md"
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}
