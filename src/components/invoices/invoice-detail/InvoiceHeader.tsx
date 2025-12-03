import { formatCurrency } from "@/lib/currency";
import { useInvoiceDetailContext } from "./InvoiceDetailContext";
import { STATUS_STYLES } from "./constants";
import { formatStatusLabel } from "./utils";

export function InvoiceHeader() {
  const ctx = useInvoiceDetailContext();
  const { state, computed } = ctx;

  const invoice = state.invoice;
  const invoiceShareUrl = computed.invoiceShareUrl;
  const balance = computed.totals.balance;
  const isArchived = state.isArchived;

  return (
    <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div>
        <button
          type="button"
          onClick={ctx.handleBackToDeal}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 transition hover:text-slate-700"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9L3.5 6l4-3" />
          </svg>
          Back to Deal
        </button>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {invoice.title || `Invoice ${invoice.invoice_number}`}
        </h1>
        <p className="mt-1 text-[13px] text-slate-600">Invoice #{invoice.invoice_number}</p>
        <div className="mt-3 inline-flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[invoice.status]}`}>
            {formatStatusLabel(invoice.status)}
          </span>
          {isArchived && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              <svg className="h-3 w-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="5" x="2" y="3" rx="1" />
                <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                <path d="M10 12h4" />
              </svg>
              Archived
            </span>
          )}
          {invoiceShareUrl ? (
            <a
              href={invoiceShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-500"
            >
              View Share Link
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 text-right">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Balance Due</p>
          <p className="text-3xl font-semibold text-slate-900">{formatCurrency(balance)}</p>
        </div>
        {!isArchived && (
          <button
            type="button"
            onClick={ctx.openSendInvoiceDialog}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-blue-700"
          >
            Send Invoice
          </button>
        )}
      </div>
    </header>
  );
}
