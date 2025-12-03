import type { InvoiceRecord, InvoicePaymentRequestRecord } from "@/features/invoices";

export const STATUS_STYLES: Record<InvoiceRecord["status"], string> = {
  unpaid: "bg-rose-100 text-rose-700 border border-rose-200",
  partial: "bg-amber-100 text-amber-700 border border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  overdue: "bg-rose-100 text-rose-700 border border-rose-200",
};

export const PAYMENT_REQUEST_STATUS_STYLES: Record<InvoicePaymentRequestRecord["status"], string> = {
  created: "text-slate-600",
  sent: "text-sky-600",
  paid: "text-emerald-600",
  cancelled: "text-rose-600",
};
