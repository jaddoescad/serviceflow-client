import { formatCurrency } from "@/lib/currency";

type TotalsSummaryProps = {
  subtotal: number;
  tax?: number;
  taxRate?: number;
  total: number;
  balanceDue?: number;
  className?: string;
};

export function TotalsSummary({
  subtotal,
  tax,
  taxRate,
  total,
  balanceDue,
  className = "",
}: TotalsSummaryProps) {
  const showTax = taxRate !== undefined && taxRate > 0 && tax !== undefined;

  return (
    <div className={`flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 text-[12px] text-slate-600 ${className}`}>
      <div className="flex items-center justify-between">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {showTax && (
        <div className="flex items-center justify-between">
          <span>Tax ({taxRate}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      )}
      <div className="flex items-center justify-between font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      {balanceDue !== undefined && (
        <div className="flex items-center justify-between text-[12px] text-slate-600">
          <span>Balance Due</span>
          <span>{formatCurrency(balanceDue)}</span>
        </div>
      )}
    </div>
  );
}
