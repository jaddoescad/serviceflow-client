import { useInvoiceDetailContext } from "./InvoiceDetailContext";
import { formatDate } from "./utils";

export function BillToSection() {
  const ctx = useInvoiceDetailContext();
  const { state, clientName, clientEmail, clientPhone } = ctx;
  const invoice = state.invoice;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Bill To</h2>
          <dl className="mt-2 space-y-1 text-[12px] text-slate-600">
            <div className="font-medium text-slate-900">{clientName}</div>
            {clientEmail ? <div>{clientEmail}</div> : null}
            {clientPhone ? <div>{clientPhone}</div> : null}
          </dl>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Invoice Dates</h2>
          <dl className="mt-2 space-y-1 text-[12px] text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">Issued</dt>
              <dd>{formatDate(invoice.issue_date)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Due</dt>
              <dd>{formatDate(invoice.due_date)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
