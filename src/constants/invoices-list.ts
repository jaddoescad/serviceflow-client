import type { InvoiceStatus } from "@/types/invoices";

export const INVOICE_LIST_PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  unpaid: "Open",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
};

export const INVOICE_STATUS_BADGE_CLASSES: Record<InvoiceStatus, string> = {
  unpaid: "border border-slate-200 bg-slate-100 text-slate-600",
  partial: "border border-amber-200 bg-amber-100 text-amber-700",
  paid: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  overdue: "border border-rose-200 bg-rose-100 text-rose-700",
};
