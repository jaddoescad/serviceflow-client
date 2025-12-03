import { createClientId } from "@/lib/form-utils";
import type { ChangeOrderRecord } from "@/types/change-orders";
import type { MoneyItem, ChangeOrderItem } from "./types";

export const formatChangeOrderLabel = (quoteNumber: string, sequence: number): string => {
  return `CO-${quoteNumber}-${String(sequence).padStart(3, "0")}`;
};

export const computeTotals = (items: MoneyItem[], taxRate: number) => {
  const subtotal = items.reduce((sum, item) => {
    const priceSource = item.unit_price ?? item.unitPrice;
    const price = Number.isFinite(priceSource) ? Number(priceSource) : 0;
    const safePrice = price > 0 ? price : 0;
    return sum + safePrice;
  }, 0);

  const taxAmount = subtotal * ((taxRate ?? 0) / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
};

export const formatAcceptedDate = (value: string | Date | null): string => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
};

export const mapSavedItems = (order: ChangeOrderRecord | null | undefined): ChangeOrderItem[] =>
  order?.items?.map((item) => ({
    id: item.id ?? createClientId(),
    name: item.name,
    description: item.description ?? "",
    unitPrice: Number.isFinite(item.unit_price) ? Number(item.unit_price) : 0,
  })) ?? [];

export const calculateActiveSequence = (
  changeOrders: ChangeOrderRecord[],
  quoteNumber: string
): number => {
  const prefix = `CO-${quoteNumber}-`;
  const maxExisting = changeOrders.reduce((max, order) => {
    const number = order.change_order_number ?? "";
    if (number.startsWith(prefix)) {
      const parsed = Number(number.slice(prefix.length));
      if (Number.isFinite(parsed)) {
        return Math.max(max, parsed);
      }
    }
    return max;
  }, 0);

  return Math.max(maxExisting + 1, changeOrders.length + 1);
};
