import { formatCurrency } from "@/lib/currency";
import type { ChangeOrderTableProps } from "../types";
import { computeTotals } from "../utils";
import { EditableLineItemCard } from "@/components/shared/line-item-card";

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
    <div>
      {!hasItems ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <p className="px-4 py-5 text-center text-sm text-slate-500">
            No change order items yet. Add your first item to start the change order.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item, index) => {
              const price = item.unit_price ?? item.unitPrice ?? 0;
              return (
                <EditableLineItemCard
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  price={price}
                  index={index}
                  onEdit={showActions && onEditItem ? () =>
                    onEditItem({
                      id: item.id,
                      name: item.name,
                      description: item.description ?? "",
                      unitPrice: price,
                    })
                  : undefined}
                  onDelete={showActions && onDeleteItem ? () => onDeleteItem(item.id) : undefined}
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
        </>
      )}
    </div>
  );
}
