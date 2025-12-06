export type ChangeOrderStatus = "pending" | "accepted";

export type SignatureType = "type" | "draw";

export type ChangeOrderItemRecord = {
  id: string;
  change_order_id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  position: number;
};

export type ChangeOrderRecord = {
  id: string;
  company_id: string;
  deal_id: string;
  quote_id: string;
  invoice_id: string | null;
  change_order_number: string;
  status: ChangeOrderStatus;
  accepted_at: string | null;
  signer_name: string | null;
  signer_email: string | null;
  signature_text: string | null;
  signature_type: SignatureType | null;
  created_at: string;
  updated_at: string;
  items: ChangeOrderItemRecord[];
};
