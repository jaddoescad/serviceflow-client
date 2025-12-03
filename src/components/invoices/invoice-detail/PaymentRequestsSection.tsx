import { formatCurrency } from "@/lib/currency";
import { useInvoiceDetailContext } from "./InvoiceDetailContext";
import { PAYMENT_REQUEST_STATUS_STYLES } from "./constants";
import { formatStatusLabel } from "./utils";

export function PaymentRequestsSection() {
  const ctx = useInvoiceDetailContext();
  const { state, computed } = ctx;

  const {
    orderedPaymentRequests,
    invoiceShareUrl,
    hasOpenPaymentRequest,
  } = computed;

  const balanceDue = state.invoice.balance_due;
  const isArchived = state.isArchived;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Payment Requests</h2>
          <p className="text-[12px] text-slate-600">
            Track deposits and progress payments for this invoice.
          </p>
        </div>
        {!isArchived && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={ctx.openRequestPaymentDialog}
              disabled={hasOpenPaymentRequest}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Request Payment
            </button>
            <button
              type="button"
              onClick={() => ctx.openReceivePaymentDialog({ amount: balanceDue })}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-700"
            >
              Receive Payment
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-slate-200 text-[12px]">
          <thead className="bg-slate-50 text-left font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Payment Request</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Invoice</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orderedPaymentRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  No payment requests yet.
                </td>
              </tr>
            ) : (
              orderedPaymentRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-3 py-3 text-slate-700">
                    <div className="font-semibold text-slate-900">Payment Request</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    {formatCurrency(request.amount)}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${PAYMENT_REQUEST_STATUS_STYLES[request.status]}`}>
                      {formatStatusLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <a
                      href={invoiceShareUrl ?? "#"}
                      className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Invoice
                    </a>
                  </td>
                  <td className="flex items-center justify-end gap-2 px-3 py-3">
                    {!isArchived && (
                      <>
                        <button
                          type="button"
                          onClick={() => ctx.openSendPaymentRequestDialog(request)}
                          className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={request.status === "paid"}
                        >
                          Send Request
                        </button>
                        <button
                          type="button"
                          onClick={() => ctx.openReceivePaymentDialog({ amount: request.amount, paymentRequestId: request.id })}
                          className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          disabled={request.status === "paid"}
                        >
                          Mark Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => ctx.openCancelRequestDialog(request)}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={request.status === "paid"}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
