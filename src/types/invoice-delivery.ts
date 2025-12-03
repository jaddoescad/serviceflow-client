export type InvoiceDeliveryMethod = "both" | "email" | "text";

export type InvoiceDeliveryTextPayload = {
  to: string;
  body: string;
};

export type InvoiceDeliveryEmailPayload = {
  to: string;
  cc?: string | null;
  subject: string;
  body: string;
};

export type InvoiceDeliveryRequestPayload = {
  method: InvoiceDeliveryMethod;
  text?: InvoiceDeliveryTextPayload | null;
  email?: InvoiceDeliveryEmailPayload | null;
};

export type InvoiceDeliveryResponsePayload = {
  sentText: boolean;
  sentEmail: boolean;
  invoiceStatus: string;
};
