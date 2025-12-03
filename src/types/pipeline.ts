import type { QuoteStatus } from "@/types/quotes";
import type { InvoiceStatus } from "@/types/invoices";

export type DealProposalSummary = {
  dealId: string;
  quoteCount: number;
  totalAmount: number;
  latestStatus: QuoteStatus;
  latestUpdatedAt: string;
  latestQuoteId: string | null;
};

export type DealInvoiceSummary = {
  dealId: string;
  invoiceCount: number;
  totalAmount: number;
  balanceDue: number;
  latestStatus: InvoiceStatus;
  latestUpdatedAt: string;
  latestInvoiceId: string | null;
};
