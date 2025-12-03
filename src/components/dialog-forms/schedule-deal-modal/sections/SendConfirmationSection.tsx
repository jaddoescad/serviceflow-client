import type { FormState, CommunicationMethod } from "../types";
import { TEMPLATE_PARAMETERS } from "../constants";
import { TemplateParameters } from "@/components/pipeline/template-parameters";

type SendConfirmationSectionProps = {
  form: FormState;
  emailSubject: string;
  emailBody: string;
  smsBody: string;
  onCommunicationMethodChange: (method: CommunicationMethod) => void;
  onEmailSubjectChange: (value: string) => void;
  onEmailBodyChange: (value: string) => void;
  onSmsBodyChange: (value: string) => void;
};

export function SendConfirmationSection({
  form,
  emailSubject,
  emailBody,
  smsBody,
  onCommunicationMethodChange,
  onEmailSubjectChange,
  onEmailBodyChange,
  onSmsBodyChange,
}: SendConfirmationSectionProps) {
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

      {(form.communicationMethod === "email" || form.communicationMethod === "both") && (
        <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Email Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => onEmailSubjectChange(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Email Message
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => onEmailBodyChange(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {(form.communicationMethod === "sms" || form.communicationMethod === "both") && (
        <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              SMS Message
            </label>
            <textarea
              value={smsBody}
              onChange={(e) => onSmsBodyChange(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Character count: {smsBody.length} / 160
            </p>
          </div>
        </div>
      )}

      {form.communicationMethod !== "none" ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
          <TemplateParameters
            tokens={TEMPLATE_PARAMETERS.map((param) => param.token)}
            description="Add these anywhere in the subject, email, or SMS to auto-fill details when sending."
          />
        </div>
      ) : null}
    </section>
  );
}
