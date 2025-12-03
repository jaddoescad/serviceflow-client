import type { ChangeEvent } from "react";
import type { ContactRecord } from "@/features/contacts";
import type { FormState } from "../types";
import { NEW_CONTACT_OPTION } from "../constants";
import { getContactDisplay } from "../utils";

type ContactInformationSectionProps = {
  form: FormState;
  isNewMode: boolean;
  isExistingContactSelected: boolean;
  selectedContact: ContactRecord | null;
  selectedContactId: string;
  contactOptions: ContactRecord[];
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSelectContact: (contactId: string) => void;
};

export function ContactInformationSection({
  form,
  isNewMode,
  isExistingContactSelected,
  selectedContact,
  selectedContactId,
  contactOptions,
  onInputChange,
  onSelectContact,
}: ContactInformationSectionProps) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Contact Information
      </h3>
      {isNewMode ? (
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Select contact</span>
          <select
            value={selectedContactId}
            onChange={(event) => onSelectContact(event.target.value)}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 focus:border-accent focus:outline-none"
          >
            <option value={NEW_CONTACT_OPTION}>New contact</option>
            {contactOptions.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {getContactDisplay(contact)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="grid gap-2.5 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>First name</span>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={onInputChange}
            placeholder="Enter first name"
            required={!isNewMode || !isExistingContactSelected}
            disabled={isNewMode && isExistingContactSelected}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
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
            disabled={isNewMode && isExistingContactSelected}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
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
            disabled={isNewMode && isExistingContactSelected}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
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
            disabled={isNewMode && isExistingContactSelected}
            className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
          />
        </label>
      </div>
      {isNewMode && isExistingContactSelected && selectedContact ? (
        <div className="rounded border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
          <p className="font-medium text-slate-700">{getContactDisplay(selectedContact)}</p>
          {selectedContact.email ? <p>{selectedContact.email}</p> : null}
          {selectedContact.phone ? <p>{selectedContact.phone}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
