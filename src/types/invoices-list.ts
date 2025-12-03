import type { InvoiceStatus } from "@/types/invoices";

export type InvoiceListRow = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customerName: string;
  dealId: string;
  dealName: string;
  proposalName: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  issueDate: string;
  dueDate: string;
  quoteId: string | null;
  email: string | null;
  phone: string | null;
};

export type InvoiceListSummary = {
  totalInvoices: number;
  totalOutstanding: number;
  totalPaid: number;
};

export type InvoiceListData = {
  rows: InvoiceListRow[];
  summary: InvoiceListSummary;
};
