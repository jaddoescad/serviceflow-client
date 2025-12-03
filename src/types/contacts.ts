export type ContactAddressRecord = {
  id: string;
  contact_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRecord = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  addresses: ContactAddressRecord[];
};

export type CreateContactAddressInput = {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type CreateContactInput = {
  company_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  addresses?: CreateContactAddressInput[];
};

export type UpdateContactInput = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
};
