import { formatCurrency } from "@/lib/currency";
import type { ChangeOrderCardProps } from "../types";
import { computeTotals, formatAcceptedDate } from "../utils";

export function ChangeOrderCard({
  order,
  taxRate,
  acceptingId,
  quoteInvoice,
  onAccept,
}: ChangeOrderCardProps) {
  const totals = computeTotals(order.items ?? [], taxRate);
  const isPending = order.status === "pending";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Change Order
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Change Order #{order.change_order_number}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                isPending ? "bg-amber-100 text-amber-800" : "bg-emerald-200 text-emerald-800"
              }`}
            >
              {isPending ? "Pending" : "Accepted"}
              {!isPending && order.accepted_at ? (
                <span className="font-normal normal-case text-[11px] text-slate-700">
                  — on {formatAcceptedDate(order.accepted_at)}
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-[13px] font-semibold text-slate-600">
              <th className="px-4 py-3">Product / Service</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Tax</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {order.items.map((item) => {
              const qty = Number.isFinite(item.quantity) ? Number(item.quantity) : 1;
              const unit = Number.isFinite(item.unit_price) ? Number(item.unit_price) : 0;
              const lineSubtotal = qty * unit;
              const lineTax = lineSubtotal * ((taxRate ?? 0) / 100);
              const lineTotal = lineSubtotal + lineTax;
              return (
                <tr key={item.id} className="text-[13px] text-slate-800">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    {item.description ? (
                      <p className="mt-1 whitespace-pre-line text-[12px] text-slate-600">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">{qty}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(unit)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(lineTax)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 text-[13px] font-semibold text-slate-900">
            <tr>
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">—</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.subtotal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.taxAmount)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {isPending ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {quoteInvoice ? (
            <button
              type="button"
              onClick={() => void onAccept(order.id)}
              disabled={acceptingId === order.id}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {acceptingId === order.id ? "Accepting..." : "Accept & Add to Invoice"}
            </button>
          ) : (
            <p className="text-xs text-slate-500">
              Accept the proposal to generate its invoice before accepting change orders.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
