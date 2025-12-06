import { formatCurrency } from "@/lib/currency";
import type { ChangeOrderTableProps } from "../types";
import { computeTotals } from "../utils";
import { ReadOnlyLineItemRow } from "@/components/shared/line-item-card";

export function ChangeOrderTable({
  items,
  taxRate,
  showActions = false,
  onEditItem,
  onDeleteItem,
}: ChangeOrderTableProps) {
  const totals = computeTotals(items, taxRate);
  const hasItems = items.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {!hasItems ? (
        <p className="px-4 py-5 text-center text-sm text-slate-500">
          No change order items yet. Add your first item to start the change order.
        </p>
      ) : (
        <>
          <div className="divide-y divide-slate-100 px-3">
            {items.map((item) => {
              const price = item.unit_price ?? item.unitPrice ?? 0;
              return (
                <div key={item.id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <ReadOnlyLineItemRow
                      name={item.name}
                      description={item.description}
                      price={price}
                    />
                  </div>
                  {showActions ? (
                    <div className="flex shrink-0 items-center gap-1 py-3">
                      {onEditItem ? (
                        <button
                          type="button"
                          onClick={() =>
                            onEditItem({
                              id: item.id,
                              name: item.name,
                              description: item.description ?? "",
                              unitPrice: price,
                            })
                          }
                          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      ) : null}
                      {onDeleteItem ? (
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="inline-flex items-center justify-center rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex justify-end">
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
          </div>
        </>
      )}
    </div>
  );
}
