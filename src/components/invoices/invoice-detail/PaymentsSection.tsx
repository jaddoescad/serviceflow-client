import { formatCurrency } from "@/lib/currency";
import { useInvoiceDetailContext } from "./InvoiceDetailContext";
import { formatStatusLabel } from "./utils";

export function PaymentsSection() {
  const ctx = useInvoiceDetailContext();
  const { state } = ctx;
  const payments = state.payments;
  const isArchived = state.isArchived;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Payments</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-slate-200 text-[12px]">
          <thead className="bg-slate-50 text-left font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Reference</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  No payments recorded yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-3 py-3 text-slate-700">
                    {new Date(payment.received_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {payment.method ? formatStatusLabel(payment.method.replace(/_/g, " ")) : "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{payment.reference ?? "—"}</td>
                  <td className="px-3 py-3 text-right">
                    {!isArchived && (
                      <button
                        type="button"
                        onClick={() => ctx.openSendReceiptDialog(payment)}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Send Payment Confirmation
                      </button>
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
