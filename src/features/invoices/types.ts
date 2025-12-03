export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export type InvoicePaymentRequestStatus = "created" | "sent" | "paid" | "cancelled";

export type InvoicePaymentMethod =
  | "cash"
  | "cheque"
  | "e_transfer"
  | "credit_card"
  | "debit"
  | "other";

export type InvoiceLineItemRecord = {
  id: string;
  invoice_id: string;
  change_order_id?: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  position: number;
  created_at: string;
  updated_at: string;
};

export type InvoiceRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  quote_id: string | null;
  invoice_number: string;
  title: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  total_amount: number;
  balance_due: number;
  notes: string | null;
  public_share_id: string;
  created_at: string;
  updated_at: string;
  line_items: InvoiceLineItemRecord[];
};

export type InvoicePaymentRequestRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  invoice_id: string;
  requested_by_user_id: string;
  amount: number;
  status: InvoicePaymentRequestStatus;
  sent_at: string | null;
  sent_via_text: boolean;
  sent_via_email: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoicePaymentRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  invoice_id: string;
  received_by_user_id: string;
  amount: number;
  received_at: string;
  method: string | null;
  reference: string | null;
  note: string | null;
  receipt_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreatePaymentRequestPayload = {
  amount: number;
  note?: string | null;
};

export type CreateLineItemPayload = {
  name: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
};

export type UpdateLineItemPayload = {
  name?: string;
  description?: string | null;
  quantity?: number;
  unit_price?: number;
};

export type LineItemMutationResponse = {
  lineItem: InvoiceLineItemRecord;
  invoice: InvoiceRecord;
};

export type DeleteLineItemResponse = {
  deletedItemId: string;
  invoice: InvoiceRecord;
  lineItems: InvoiceLineItemRecord[];
};
