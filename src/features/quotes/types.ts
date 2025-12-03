export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export type QuoteLineItemRecord = {
  id: string;
  quote_id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  position: number;
  created_at: string;
  updated_at: string;
};

export type QuoteRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  quote_number: string;
  title: string;
  client_message: string | null;
  disclaimer: string | null;
  status: QuoteStatus;
  public_share_id: string;
  created_at: string;
  updated_at: string;
  line_items: QuoteLineItemRecord[];
  acceptance_signature: string | null;
  acceptance_signed_at: string | null;
};

export type QuoteAttachment = {
  id: string;
  storage_key: string;
  thumbnail_key: string | null;
  original_filename: string;
  content_type: string;
  byte_size: number;
  uploaded_at: string;
};

export type QuoteWithAttachments = QuoteRecord & {
  proposal_attachments: QuoteAttachment[];
};

export type EditableQuoteLineItem = {
  id?: string;
  client_id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: string;
  isDiscount?: boolean;
};

export type UpsertQuoteInput = {
  id?: string;
  company_id: string;
  deal_id: string;
  quote_number: string;
  title: string;
  client_message: string | null;
  disclaimer: string | null;
  status: QuoteStatus;
};

export type UpsertQuoteLineItemInput = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  position: number;
};

export type SaveQuotePayload = {
  quote: UpsertQuoteInput;
  lineItems: UpsertQuoteLineItemInput[];
  deletedLineItemIds: string[];
};

// Quote Delivery Types
export type QuoteDeliveryMethod = "both" | "text" | "email";

export type QuoteDeliveryRequestPayload = {
  method: QuoteDeliveryMethod;
  text?: {
    to: string;
    body: string;
  };
  email?: {
    to: string;
    cc?: string | null;
    subject: string;
    body: string;
  };
};

export type QuoteDeliveryResponsePayload = {
  sentText: boolean;
  sentEmail: boolean;
  quoteStatus: string;
};
