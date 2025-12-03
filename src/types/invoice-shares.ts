import type { InvoiceRecord } from "@/types/invoices";

export type InvoiceShareCompany = {
  id: string;
  name: string | null;
  physical_company_name: string | null;
  physical_address_line1: string | null;
  physical_address_line2: string | null;
  physical_city: string | null;
  physical_state: string | null;
  physical_zip: string | null;
  email: string | null;
  phone_number: string | null;
  website: string | null;
  review_url: string | null;
  logo_storage_key: string | null;
  logo_url?: string | null;
};

export type InvoiceShareCustomer = {
  name: string;
  email: string | null;
  phone: string | null;
};

export type InvoiceShareSnapshot = {
  invoice: InvoiceRecord;
  company: InvoiceShareCompany | null;
  customer: InvoiceShareCustomer;
  propertyAddress: string | null;
};
