import type { FormState, CommunicationMethod, ReminderSettings } from "../types";

type SendConfirmationSectionProps = {
  form: FormState;
  onCommunicationMethodChange: (method: CommunicationMethod) => void;
  onReminderChange: (key: keyof ReminderSettings, value: boolean) => void;
};

export function SendConfirmationSection({
  form,
  onCommunicationMethodChange,
  onReminderChange,
}: SendConfirmationSectionProps) {
  const showEmailReminders = form.communicationMethod === "email" || form.communicationMethod === "both";
  const showSmsReminders = form.communicationMethod === "sms" || form.communicationMethod === "both";

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Send Confirmation
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => onCommunicationMethodChange("both")}
          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
            form.communicationMethod === "both"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          Email + SMS
        </button>
        <button
          type="button"
          onClick={() => onCommunicationMethodChange("email")}
          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
            form.communicationMethod === "email"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => onCommunicationMethodChange("sms")}
          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
            form.communicationMethod === "sms"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          SMS
        </button>
        <button
          type="button"
          onClick={() => onCommunicationMethodChange("none")}
          className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
            form.communicationMethod === "none"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          None
        </button>
      </div>

      {showEmailReminders && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600 mb-2">
            Email Reminders
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reminders.email1DayBefore}
                onChange={(e) => onReminderChange("email1DayBefore", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[12px] text-slate-700">Reminder 1 day before</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reminders.email1HourBefore}
                onChange={(e) => onReminderChange("email1HourBefore", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[12px] text-slate-700">Reminder 1 hour before</span>
            </label>
          </div>
        </div>
      )}

      {showSmsReminders && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600 mb-2">
            SMS Reminders
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reminders.sms1DayBefore}
                onChange={(e) => onReminderChange("sms1DayBefore", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[12px] text-slate-700">Reminder 1 day before</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reminders.sms1HourBefore}
                onChange={(e) => onReminderChange("sms1HourBefore", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[12px] text-slate-700">Reminder 1 hour before</span>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
