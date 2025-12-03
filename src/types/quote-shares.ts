import type { QuoteRecord } from "@/types/quotes";

export type QuoteShareCompany = {
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
  proposal_terms_template_key: string | null;
  proposal_terms_template_content: string | null;
  logo_url?: string | null;
  tax_rate: number | null;
};

export type QuoteShareCustomer = {
  name: string;
  email: string | null;
  phone: string | null;
};

export type QuoteShareSnapshot = {
  quote: QuoteRecord;
  company: QuoteShareCompany | null;
  customer: QuoteShareCustomer;
  propertyAddress: string | null;
};
