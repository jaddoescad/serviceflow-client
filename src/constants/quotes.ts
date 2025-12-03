import type { QuoteStatus } from "@/types/quotes";

export const QUOTE_LINE_ITEM_FIELDS = [
  "id",
  "quote_id",
  "name",
  "description",
  "quantity",
  "unit_price",
  "position",
  "created_at",
  "updated_at",
].join(", ");

export const QUOTE_FIELDS = [
  "id",
  "company_id",
  "deal_id",
  "quote_number",
  "title",
  "client_message",
  "disclaimer",
  "status",
  "public_share_id",
  "created_at",
  "updated_at",
  `line_items:quote_line_items(${QUOTE_LINE_ITEM_FIELDS})`,
].join(", ");

export const QUOTE_STATUS_OPTIONS: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "declined",
];

export const QUOTE_DEFAULT_CLIENT_MESSAGE =
  "Thank you for considering our services. We look forward to working with you.";

export const QUOTE_DEFAULT_DISCLAIMER =
  "This quote is valid for the next 30 days, after which values may be subject to change.";
