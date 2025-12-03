export type CompanyBrandingDetails = {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  website: string | null;
  review_url: string | null;
  logo_storage_key: string | null;
};

export type QuoteCompanyBranding = {
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  reviewUrl: string | null;
  logoUrl: string | null;
};

export type BrandingApiResponse = {
  branding?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    reviewUrl?: string | null;
    logoUrl?: string | null;
  };
  error?: string;
};
