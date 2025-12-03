import type { ContactStatusOption, ContactTypeOption } from "@/types/contact-list";

export const CONTACT_TYPE_OPTIONS: ReadonlyArray<ContactTypeOption> = [
  { value: "customer", label: "Customer" },
  { value: "lead", label: "Lead" },
];

export const CONTACT_STATUS_OPTIONS: ReadonlyArray<ContactStatusOption> = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export const CONTACT_LIST_PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;
