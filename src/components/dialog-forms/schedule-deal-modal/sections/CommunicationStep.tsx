import type { ChangeEvent } from "react";
import type { FormState, CommunicationMethod } from "../types";

type CommunicationStepProps = {
  form: FormState;
  onCheckboxChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onCommunicationMethodChange: (method: CommunicationMethod) => void;
};

const COMMUNICATION_OPTIONS: { value: CommunicationMethod; label: string }[] = [
  { value: "both", label: "Email & SMS" },
  { value: "email", label: "Email only" },
  { value: "sms", label: "SMS only" },
  { value: "none", label: "None" },
];

export function CommunicationStep({
  form,
  onCheckboxChange,
  onCommunicationMethodChange,
}: CommunicationStepProps) {
  const hasContactMethod = Boolean(form.email.trim() || form.phone.trim());
  const hasEmail = Boolean(form.email.trim());
  const hasPhone = Boolean(form.phone.trim());

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-[12px] text-slate-600">
          How would you like to communicate with the customer?
        </p>
        {!hasContactMethod && (
          <p className="text-[11px] text-amber-600">
            No email or phone provided. Communication will be skipped.
          </p>
        )}
      </div>

      {/* Communication method selection */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-slate-500">Send via</label>
        <div className="flex flex-wrap gap-2">
          {COMMUNICATION_OPTIONS.map((option) => {
            const isDisabled =
              (option.value === "email" && !hasEmail) ||
              (option.value === "sms" && !hasPhone) ||
              (option.value === "both" && (!hasEmail || !hasPhone));

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => !isDisabled && onCommunicationMethodChange(option.value)}
                disabled={isDisabled}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  form.communicationMethod === option.value
                    ? "border-accent bg-accent text-white"
                    : isDisabled
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Communication options - only show if not "none" */}
      {form.communicationMethod !== "none" && hasContactMethod && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="sendConfirmation"
              checked={form.sendConfirmation}
              onChange={onCheckboxChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            <div>
              <p className="text-[12px] font-medium text-slate-700">
                Appointment confirmation
              </p>
              <p className="text-[11px] text-slate-500">
                Send immediately after scheduling
              </p>
            </div>
          </label>

          <div className="border-t border-slate-100" />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="sendReminder"
              checked={form.sendReminder}
              onChange={onCheckboxChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            <div>
              <p className="text-[12px] font-medium text-slate-700">
                1-day reminder
              </p>
              <p className="text-[11px] text-slate-500">
                Send 24 hours before the appointment
              </p>
            </div>
          </label>
        </div>
      )}

      {form.communicationMethod === "none" && (
        <p className="text-[11px] text-slate-500 italic">
          No confirmation or reminder will be sent.
        </p>
      )}
    </section>
  );
}
