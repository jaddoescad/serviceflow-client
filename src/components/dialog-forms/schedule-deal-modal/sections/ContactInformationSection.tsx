import type { ChangeEvent } from "react";
import type { FormState } from "../types";

type ContactInformationSectionProps = {
  form: FormState;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function ContactInformationSection({
  form,
  onInputChange,
}: ContactInformationSectionProps) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>First name</span>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={onInputChange}
            placeholder="Enter first name"
            required
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Last name</span>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={onInputChange}
            placeholder="Enter last name"
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onInputChange}
            placeholder="Enter email"
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Phone</span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onInputChange}
            placeholder="Enter phone number"
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          />
        </label>
      </div>
    </section>
  );
}
