export type ContactListType = "customer" | "lead";

export type ContactListStatus = "active" | "archived";

export type ContactTypeOption = {
  value: ContactListType;
  label: string;
};

export type ContactStatusOption = {
  value: ContactListStatus;
  label: string;
};

export type ContactListRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: ContactListType;
  source: string | null;
  address: string | null;
  salesperson: string | null;
  balance: number;
  archived: boolean;
};

export type ContactListSummary = {
  invalidPhoneCount: number;
  totalContacts: number;
  types: ContactListType[];
  sources: string[];
  salespeople: string[];
  statuses: ContactListStatus[];
};

export type ContactListData = {
  rows: ContactListRow[];
  summary: ContactListSummary;
};
