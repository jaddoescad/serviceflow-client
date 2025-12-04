import type { ChangeEvent } from "react";
import type { FormState } from "./types";

type ContactInfoSectionProps = {
  form: FormState;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function ContactInfoSection({ form, onInputChange }: ContactInfoSectionProps) {
  return (
    <section className="space-y-3">
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>First name</span>
          <input
            type="text"
            name="firstName"
            placeholder="Enter first name"
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            value={form.firstName}
            onChange={onInputChange}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Last name</span>
          <input
            type="text"
            name="lastName"
            placeholder="Enter last name"
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            value={form.lastName}
            onChange={onInputChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="customer@example.com"
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            value={form.email}
            onChange={onInputChange}
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Phone</span>
          <input
            type="tel"
            name="phone"
            placeholder="(555) 123-4567"
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            value={form.phone}
            onChange={onInputChange}
          />
        </label>
      </div>
    </section>
  );
}
