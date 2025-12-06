import { formatCurrency } from "@/lib/currency";
import type { ChangeOrderCardProps } from "../types";
import { computeTotals, formatAcceptedDate } from "../utils";
import { ReadOnlyLineItemRow } from "@/components/shared/line-item-card";

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

      <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white px-3">
        {order.items.map((item) => {
          const unit = Number.isFinite(item.unit_price) ? Number(item.unit_price) : 0;
          return (
            <ReadOnlyLineItemRow
              key={item.id}
              name={item.name}
              description={item.description}
              price={unit}
            />
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-1 text-right text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {(taxRate ?? 0) > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
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
