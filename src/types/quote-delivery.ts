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
