import type { InvoiceStatus, InvoicePaymentRequestStatus } from "./types";

export const INVOICE_LINE_ITEM_FIELDS = [
  "id",
  "invoice_id",
  "name",
  "description",
  "quantity",
  "unit_price",
  "position",
  "created_at",
  "updated_at",
].join(", ");

export const INVOICE_FIELDS = [
  "id",
  "company_id",
  "deal_id",
  "quote_id",
  "invoice_number",
  "title",
  "status",
  "issue_date",
  "due_date",
  "total_amount",
  "balance_due",
  "notes",
  "public_share_id",
  "created_at",
  "updated_at",
].join(", ");

export const INVOICE_WITH_LINE_ITEMS_FIELDS = `${INVOICE_FIELDS}, line_items:invoice_line_items(${INVOICE_LINE_ITEM_FIELDS})`;

export const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = [
  "unpaid",
  "partial",
  "paid",
  "overdue",
];

export const INVOICE_PAYMENT_REQUEST_FIELDS = [
  "id",
  "company_id",
  "deal_id",
  "invoice_id",
  "requested_by_user_id",
  "amount",
  "status",
  "sent_at",
  "sent_via_text",
  "sent_via_email",
  "note",
  "created_at",
  "updated_at",
].join(", ");

export const INVOICE_PAYMENT_REQUEST_STATUS_OPTIONS: InvoicePaymentRequestStatus[] = [
  "created",
  "sent",
  "paid",
  "cancelled",
];

export const INVOICE_PAYMENT_FIELDS = [
  "id",
  "company_id",
  "deal_id",
  "invoice_id",
  "received_by_user_id",
  "amount",
  "received_at",
  "method",
  "reference",
  "note",
  "receipt_sent_at",
  "created_at",
  "updated_at",
].join(", ");
