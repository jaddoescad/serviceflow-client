import { formatCurrency } from "@/lib/currency";
import type { ChangeOrderTableProps, ChangeOrderItem } from "../types";
import { computeTotals } from "../utils";

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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr className="text-left text-[13px] font-semibold text-slate-600">
            <th className="px-4 py-3">Product / Service</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">Tax</th>
            <th className="px-4 py-3 text-right">Total</th>
            {showActions ? <th className="px-4 py-3 text-right">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {!hasItems ? (
            <tr>
              <td colSpan={showActions ? 5 : 4} className="px-4 py-5 text-center text-sm text-slate-500">
                No change order items yet. Add your first item to start the change order.
              </td>
            </tr>
          ) : null}
          {items.map((item) => {
            const price = item.unit_price ?? item.unitPrice ?? 0;
            const lineSubtotal = price;
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
                <td className="px-4 py-3 text-right">{formatCurrency(price)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(lineTax)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(lineTotal)}</td>
                {showActions ? (
                  <td className="px-4 py-3 text-right align-top">
                    <div className="flex items-center justify-end gap-1">
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
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
        {hasItems ? (
          <tfoot className="bg-slate-50 text-[13px] font-semibold text-slate-900">
            <tr>
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.subtotal)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.taxAmount)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totals.total)}</td>
              {showActions ? <td /> : null}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
