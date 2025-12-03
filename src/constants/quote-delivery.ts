import type { QuoteDeliveryMethod } from "@/types/quote-delivery";

export const QUOTE_DELIVERY_METHOD_LABELS: Record<QuoteDeliveryMethod, string> = {
  both: "Both Email and Text",
  text: "Text Message",
  email: "Email",
};

export const QUOTE_DELIVERY_METHOD_ORDER: QuoteDeliveryMethod[] = ["both", "text", "email"];

export const QUOTE_DELIVERY_DEFAULT_TEXT_MESSAGE =
  "Your proposal from our team is ready. {{proposal_button}}";

export const QUOTE_DELIVERY_DEFAULT_EMAIL_BODY =
  "Hello,\n\n{{proposal_button}}\n\nLet us know if you have any questions.";
