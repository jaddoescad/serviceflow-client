import type { ChangeEvent } from "react";
import { TemplateParameters } from "@/components/pipeline/template-parameters";
import type { FormState } from "./types";
import { TEMPLATE_TOKENS } from "./types";

type CommunicationSectionProps = {
  form: FormState;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onTextareaChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export function CommunicationSection({
  form,
  onChange,
  onTextareaChange,
}: CommunicationSectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-4 text-[11px] text-slate-600">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="sendEmail"
            checked={form.sendEmail}
            onChange={onChange}
            className="h-3.5 w-3.5 rounded border border-slate-300"
          />
          <span>Send Email</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="sendSms"
            checked={form.sendSms}
            onChange={onChange}
            className="h-3.5 w-3.5 rounded border border-slate-300"
          />
          <span>Send SMS</span>
        </label>
      </div>

      {form.sendEmail ? (
        <div className="grid gap-2">
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Email Subject</span>
            <input
              type="text"
              name="emailSubject"
              value={form.emailSubject}
              onChange={onChange}
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Email Recipients</span>
            <input
              type="text"
              name="emailRecipients"
              value={form.emailRecipients}
              onChange={onChange}
              placeholder="name@example.com"
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
            <span className="text-[10px] font-normal text-slate-400">
              Separate multiple addresses with commas.
            </span>
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Email Message</span>
            <textarea
              name="emailMessage"
              value={form.emailMessage}
              onChange={onTextareaChange}
              rows={6}
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      ) : null}

      {form.sendSms ? (
        <div className="grid gap-2">
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>SMS Recipients</span>
            <input
              type="text"
              name="smsRecipients"
              value={form.smsRecipients}
              onChange={onChange}
              placeholder="(555) 555-5555"
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
            <span className="text-[10px] font-normal text-slate-400">
              Use commas to include multiple phone numbers.
            </span>
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>SMS Message</span>
            <textarea
              name="smsMessage"
              value={form.smsMessage}
              onChange={onTextareaChange}
              rows={4}
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      ) : null}

      {(form.sendEmail || form.sendSms) ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <TemplateParameters
            tokens={TEMPLATE_TOKENS}
            description="Use these placeholders in the subject, email, or SMS. They'll auto-fill with job details when sent."
          />
        </div>
      ) : null}
    </section>
  );
}
