import type {
  InvoiceRecord,
  InvoicePaymentRequestRecord,
  InvoicePaymentRecord,
} from "@/features/invoices";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import type { InvoiceDeliveryMethod } from "@/types/invoice-delivery";

export type TemplateContext = {
  companyName: string;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  clientName: string;
  invoiceNumber: string;
  invoiceUrl?: string | null;
  paymentAmount?: string | null;
};

export type InvoiceDetailProps = {
  companyId: string;
  companyName: string;
  companyEmail: string | null;
  companyPhone: string | null;
  companyWebsite: string | null;
  dealId: string;
  invoice: InvoiceRecord;
  paymentRequests: InvoicePaymentRequestRecord[];
  payments: InvoicePaymentRecord[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  invoiceTemplate: CommunicationTemplateSnapshot;
  paymentRequestTemplate: CommunicationTemplateSnapshot;
  paymentReceiptTemplate: CommunicationTemplateSnapshot;
  isArchived?: boolean;
};

export type RequestPaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  balanceDue: number;
  total: number;
  onSubmit: (input: { amount: number; note: string | null }) => Promise<void>;
  submitting: boolean;
};

export type SendPaymentRequestDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (input: {
    method: InvoiceDeliveryMethod;
    text?: { to: string; body: string };
    email?: { to: string; cc?: string | null; subject: string; body: string };
  }) => Promise<void>;
  submitting: boolean;
  request: InvoicePaymentRequestRecord | null;
  templateDefaults: {
    smsBody: string;
    emailSubject: string;
    emailBody: string;
  } | null;
  clientPhone: string;
  clientEmail: string;
  companyEmail: string | null;
};

export type SendPaymentReceiptDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (input: { receiptEmail: string; receiptSubject: string; receiptBody: string }) => Promise<void>;
  submitting: boolean;
  payment: InvoicePaymentRecord | null;
  defaultBody: string;
  defaultSubject: string;
  clientEmail: string;
};

export type ReceivePaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    amount: number;
    receivedAt: string;
    method: string | null;
    reference: string | null;
    note: string | null;
    sendReceipt: boolean;
    receiptEmail: string | null;
    receiptSubject: string | null;
    receiptBody: string | null;
    paymentRequestId?: string | null;
  }) => Promise<void>;
  submitting: boolean;
  defaultAmount: number;
  defaultDate: string;
  clientEmail: string;
  defaultReceiptBody: string;
  defaultReceiptSubject: string;
  paymentRequestId?: string | null;
};
