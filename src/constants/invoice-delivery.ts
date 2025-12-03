import type { InvoiceDeliveryMethod } from "@/types/invoice-delivery";

export const INVOICE_DELIVERY_METHOD_LABELS: Record<InvoiceDeliveryMethod, string> = {
  both: "Both Email and Text",
  text: "Text Message",
  email: "Email",
};

export const INVOICE_DELIVERY_METHOD_ORDER: InvoiceDeliveryMethod[] = ["both", "text", "email"];

export const INVOICE_DELIVERY_DEFAULT_TEXT_MESSAGE =
  "Please review invoice {{invoice_number}} from {{company_name}}: {{invoice_button}}\n\nWe accept Cash, Cheque or E-Transfer to info@paintersottawa.com";

export const INVOICE_DELIVERY_DEFAULT_EMAIL_BODY =
  "Hello,\n\nPlease review invoice {{invoice_number}} from {{company_name}}.\n{{invoice_button}}\n\nWe accept Cash, Cheque or E-Transfer to info@paintersottawa.com";
