"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuoteAndNavigate } from "@/features/quotes";
import type {
  DealDetailSnapshot,
  DealInvoiceRecord,
  DealProposalRecord,
} from "@/types/deal-details";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatDate = (value: string | undefined) => {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const proposalStatusStyles: Record<DealProposalRecord["status"], string> = {
  draft: "text-rose-600",
  sent: "text-sky-600",
  signed: "text-emerald-600",
  declined: "text-rose-600",
};

const invoiceStatusStyles: Record<DealInvoiceRecord["status"], string> = {
  unpaid: "text-rose-600",
  partial: "text-amber-600",
  paid: "text-emerald-600",
  overdue: "text-rose-600",
};

const formatInvoiceStatusLabel = (status: DealInvoiceRecord["status"] | null | undefined): string => {
  if (!status) {
    return "Unknown";
  }

  const readable = status.replace(/_/g, " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
};

type DocumentFilter = "all" | "proposal" | "invoice";

type DealDocumentsCardProps = Pick<DealDetailSnapshot, "proposals" | "invoices"> & {
  companyId: string;
  dealId: string;
  className?: string;
  isArchived?: boolean;
};

type DocumentListItem = {
  id: string;
  kind: "proposal" | "invoice";
  title: string;
  amount: number;
  statusLabel: string;
  statusTone: string;
  meta: string[];
  sortValue: number;
  href?: string;
};

const filters: Array<{ id: DocumentFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "proposal", label: "Quotes" },
  { id: "invoice", label: "Invoice" },
];

export function DealDocumentsCard({ companyId, dealId, proposals, invoices, className, isArchived = false }: DealDocumentsCardProps) {
  const navigate = useNavigate();
  const { createQuoteAndNavigate, isCreating } = useCreateQuoteAndNavigate();
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleClickAway = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [isMenuOpen]);

  const handleCreate = (kind: "proposal" | "invoice") => {
    setIsMenuOpen(false);
    if (kind === "proposal") {
      createQuoteAndNavigate({ companyId, dealId });
      return;
    }
    // Placeholder for invoice routing.
    console.info(`Request to create new ${kind}`);
  };

  const items = useMemo<DocumentListItem[]>(() => {
    const toProposalItem = (proposal: DealProposalRecord, index: number): DocumentListItem => {
      const meta: string[] = [];
      if (proposal.sent_at) meta.push(`Sent ${formatDate(proposal.sent_at)}`);
      if (proposal.signed_at) meta.push(`Signed ${formatDate(proposal.signed_at)}`);
      if (proposal.expires_at) meta.push(`Expires ${formatDate(proposal.expires_at)}`);

      const sortValue = Date.parse(proposal.sent_at ?? proposal.signed_at ?? proposal.expires_at ?? "") || index * -1;

      return {
        id: `proposal-${proposal.id}`,
        kind: "proposal",
        title: proposal.name,
        amount: proposal.total,
        statusLabel: proposal.status,
        statusTone: proposalStatusStyles[proposal.status],
        meta,
        sortValue,
        href: `/deals/${dealId}/proposals/quote?quoteId=${proposal.id}`,
      };
    };

    const toInvoiceItem = (invoice: DealInvoiceRecord, index: number): DocumentListItem => {
      const issued = formatDate(invoice.issue_date);
      const due = formatDate(invoice.due_date);
      const meta: string[] = [];
      if (issued) meta.push(`Issued ${issued}`);
      if (due) meta.push(`Due ${due}`);
      meta.push(`Balance ${currencyFormatter.format(invoice.balance)} of ${currencyFormatter.format(invoice.total)}`);

      const sortValue = Date.parse(invoice.due_date) || Date.parse(invoice.issue_date) || index * -1;

      const status = invoice.status ?? "unpaid";

      return {
        id: `invoice-${invoice.id}`,
        kind: "invoice",
        title: invoice.title || invoice.number,
        amount: invoice.total,
        statusLabel: formatInvoiceStatusLabel(status),
        statusTone: invoiceStatusStyles[status],
        meta,
        sortValue,
        href: `/deals/${dealId}/invoices/${invoice.id}`,
      };
    };

    const proposalItems = proposals.map(toProposalItem);
    const invoiceItems = invoices.map(toInvoiceItem);

    return [...proposalItems, ...invoiceItems].sort((a, b) => b.sortValue - a.sortValue);
  }, [dealId, invoices, proposals]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return items;
    }
    return items.filter((item) => item.kind === activeFilter);
  }, [activeFilter, items]);

  return (
    <section
      className={`flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <header className="flex flex-col gap-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
          {!isArchived && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((previous) => !previous)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                New
                <svg
                  className={`h-3 w-3 text-slate-500 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5l3 3 3-3" />
                </svg>
              </button>
              {isMenuOpen ? (
                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-md border border-slate-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleCreate("proposal")}
                    className="block w-full px-3 py-2 text-left text-[12px] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreate("invoice")}
                    className="block w-full px-3 py-2 text-left text-[12px] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Invoice
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
        <div className="flex w-full gap-1 rounded-md bg-slate-100 p-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-1 rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-center transition ${
                activeFilter === filter.id
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <ul className="flex flex-1 flex-col divide-y divide-slate-100 overflow-auto">
        {filteredItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => {
                if (item.href) {
                  navigate(item.href);
                }
              }}
              disabled={!item.href}
              className={`flex w-full flex-col gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 transition disabled:opacity-100 md:px-4 ${
                item.href ? "cursor-pointer hover:bg-slate-50" : "cursor-default"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      item.kind === "proposal" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.kind === "proposal" ? "Quote" : "Invoice"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="whitespace-normal text-left text-[13px] font-medium text-slate-900">
                    {item.title}
                  </p>
                  <span className="mt-1 block text-left text-[13px] font-semibold text-slate-900">
                    {currencyFormatter.format(item.amount)}
                  </span>
                  {item.meta.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2 text-left text-[11px] text-slate-500">
                      {item.meta.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center">
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${item.statusTone}`}>
                    {item.statusLabel}
                  </span>
                </div>
              </div>
            </button>
          </li>
        ))}
        {filteredItems.length === 0 ? (
          <li className="py-4 text-center text-[12px] text-slate-500">No documents in this view.</li>
        ) : null}
      </ul>
    </section>
  );
}
