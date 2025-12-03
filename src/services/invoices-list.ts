import { apiClient } from "@/services/api";
import type { InvoiceListRow, InvoiceListSummary } from "@/types/invoices-list";

export const fetchInvoiceListData = async (
    companyId: string,
    options?: { salespersonName?: string | null }
) => {
  const invoices = await apiClient<any[]>('/invoices', {
    params: { company_id: companyId }
  });

  // Filter if needed based on options

  const rows: InvoiceListRow[] = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      status: inv.status,
      customerName: 'Unknown', // Would need join or separate fetch
      dealId: inv.deal_id,
      dealName: 'Unknown',
      proposalName: 'Unknown',
      totalAmount: inv.total_amount,
      amountPaid: inv.total_amount - inv.balance_due,
      balanceDue: inv.balance_due,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      quoteId: null,
      email: null,
      phone: null
  }));

  const summary: InvoiceListSummary = {
      totalInvoices: rows.length,
      totalOutstanding: 0,
      totalPaid: 0
  };

  return { rows, summary };
};
