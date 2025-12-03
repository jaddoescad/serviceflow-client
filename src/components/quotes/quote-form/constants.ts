import type { QuoteRecord } from "@/features/quotes";

export const STATUS_STYLES: Record<QuoteRecord["status"], string> = {
  draft: "border-amber-200 bg-amber-100 text-amber-700",
  sent: "border-blue-200 bg-blue-100 text-blue-700",
  accepted: "border-emerald-200 bg-emerald-100 text-emerald-700",
  declined: "border-rose-200 bg-rose-100 text-rose-700",
};
