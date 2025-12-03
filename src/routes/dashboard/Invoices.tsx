import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useInvoiceList } from "@/hooks";
import { InvoiceListFilters } from "@/components/invoices/invoice-list-filters";
import {
  INVOICE_LIST_PAGE_SIZE_OPTIONS,
  INVOICE_STATUS_BADGE_CLASSES,
  INVOICE_STATUS_LABELS,
} from "@/constants/invoices-list";
import { INVOICE_STATUS_OPTIONS } from "@/constants/invoices";
import { formatCurrency } from "@/lib/currency";
import { InvoiceListSkeleton } from "@/components/ui/skeleton";
import type { InvoiceListRow } from "@/types/invoices-list";
import type { InvoiceStatus } from "@/types/invoices";

function extractParam(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key) || undefined;
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (INVOICE_LIST_PAGE_SIZE_OPTIONS.includes(parsed as (typeof INVOICE_LIST_PAGE_SIZE_OPTIONS)[number])) {
    return parsed;
  }
  return INVOICE_LIST_PAGE_SIZE_OPTIONS[0];
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildFiltersQuery(
  filters: Record<string, string>,
  overrides?: Record<string, string | number | undefined>
): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function matchesSearch(row: InvoiceListRow, search: string, numericSearch: string): boolean {
  if (!search && !numericSearch) {
    return true;
  }

  const haystacks = [
    row.customerName,
    row.dealName,
    row.proposalName,
    row.invoiceNumber,
    row.email ?? "",
  ].map((value) => value.toLowerCase());

  const hasTextMatch = search ? haystacks.some((value) => value.includes(search)) : false;

  const phoneDigits = row.phone?.replace(/\D+/g, "") ?? "";
  const invoiceDigits = row.invoiceNumber.replace(/\D+/g, "");
  const hasNumericMatch = numericSearch
    ? [phoneDigits, invoiceDigits].some((value) => value.includes(numericSearch))
    : false;

  return hasTextMatch || hasNumericMatch;
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return "—";
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { data, isLoading: invoicesLoading } = useInvoiceList(company?.id);

  const rows = data?.rows ?? [];
  const summary = data?.summary ?? null;

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || invoicesLoading || !summary) {
    return <InvoiceListSkeleton rows={10} />;
  }

  const searchRaw = (extractParam(searchParams, "search") ?? "").trim();
  const statusRaw = (extractParam(searchParams, "status") ?? "all").toLowerCase();
  const pageSize = parsePageSize(extractParam(searchParams, "pageSize"));
  const requestedPage = parsePage(extractParam(searchParams, "page"));

  const search = searchRaw.toLowerCase();
  const numericSearch = searchRaw.replace(/\D+/g, "");
  const status = statusRaw as InvoiceStatus | "all";

  const filteredRows = rows.filter((row) => {
    if (!matchesSearch(row, search, numericSearch)) {
      return false;
    }

    if (status !== "all" && row.status !== status) {
      return false;
    }

    return true;
  });

  const sortedRows = filteredRows
    .slice()
    .sort((a, b) => toTimestamp(b.issueDate) - toTimestamp(a.issueDate));

  const totalFiltered = sortedRows.length;
  const totalPages = totalFiltered === 0 ? 1 : Math.ceil(totalFiltered / pageSize);
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const startIndex = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + pageSize);
  const endIndex = totalFiltered === 0 ? 0 : startIndex + paginatedRows.length;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const baseFilters: Record<string, string> = {
    search: searchRaw,
    status: status !== "all" ? status : "",
    pageSize: String(pageSize),
  };

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-900">Invoices</h1>
        <p className="text-[11px] text-slate-500">
          {summary.totalInvoices} total invoices • {formatCurrency(summary.totalOutstanding)} outstanding •
          {" "}
          {formatCurrency(summary.totalPaid)} collected
        </p>
      </header>

      <InvoiceListFilters
        search={searchRaw}
        status={status}
        statusOptions={INVOICE_STATUS_OPTIONS}
        pageSize={pageSize}
        pageSizeOptions={INVOICE_LIST_PAGE_SIZE_OPTIONS}
        resetHref="/invoices"
        statusLabels={INVOICE_STATUS_LABELS}
      />

      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-slate-50">
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Customer</HeaderCell>
                <HeaderCell>Proposal Name</HeaderCell>
                <HeaderCell>Invoice ID</HeaderCell>
                <HeaderCell className="text-right">Amount</HeaderCell>
                <HeaderCell className="text-right">Paid</HeaderCell>
                <HeaderCell className="text-right">Balance</HeaderCell>
                <HeaderCell>Issue Date</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-slate-500">
                    No invoices match your filters yet.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const label = INVOICE_STATUS_LABELS[row.status];
                  const badgeClasses = INVOICE_STATUS_BADGE_CLASSES[row.status];

                  return (
                    <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                      <BodyCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${badgeClasses}`}
                        >
                          {label}
                        </span>
                      </BodyCell>
                      <BodyCell>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-semibold text-slate-900">{row.customerName}</span>
                          <span className="text-[10px] text-slate-500">{row.dealName}</span>
                        </div>
                      </BodyCell>
                      <BodyCell>
                        <span className="text-[12px] text-slate-700">{row.proposalName || "—"}</span>
                      </BodyCell>
                      <BodyCell>
                        <Link
                          to={`/deals/${row.dealId}/invoices/${row.id}`}
                          className="text-[12px] font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          {row.invoiceNumber}
                        </Link>
                      </BodyCell>
                      <BodyCell className="text-right font-semibold text-slate-900">
                        {formatCurrency(row.totalAmount)}
                      </BodyCell>
                      <BodyCell className="text-right text-slate-700">
                        {formatCurrency(row.amountPaid)}
                      </BodyCell>
                      <BodyCell className="text-right text-slate-700">
                        {formatCurrency(row.balanceDue)}
                      </BodyCell>
                      <BodyCell>{formatDate(row.issueDate)}</BodyCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[11px] text-slate-600">
          <p>
            Showing {totalFiltered === 0 ? 0 : startIndex + 1} to {endIndex} of {totalFiltered} entries
          </p>
          <div className="flex items-center gap-1.5">
            {currentPage > 1 ? (
              <PaginationLink to={buildFiltersQuery(baseFilters, { page: currentPage - 1 })}>
                Prev
              </PaginationLink>
            ) : (
              <PaginationDisabled>Prev</PaginationDisabled>
            )}

            {pageNumbers.map((pageNumber) =>
              pageNumber === currentPage ? (
                <PaginationDisabled key={pageNumber} active>
                  {pageNumber}
                </PaginationDisabled>
              ) : (
                <PaginationLink key={pageNumber} to={buildFiltersQuery(baseFilters, { page: pageNumber })}>
                  {pageNumber}
                </PaginationLink>
              )
            )}

            {currentPage < totalPages ? (
              <PaginationLink to={buildFiltersQuery(baseFilters, { page: currentPage + 1 })}>
                Next
              </PaginationLink>
            ) : (
              <PaginationDisabled>Next</PaginationDisabled>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}

function HeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`sticky top-0 border-b border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 ${
        className ?? ""
      }`}
    >
      {children}
    </th>
  );
}

function BodyCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-2 text-[12px] text-slate-700 ${className ?? ""}`}>{children}</td>
  );
}

function PaginationLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md border border-slate-200 px-2.5 py-1.25 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
    >
      {children}
    </Link>
  );
}

function PaginationDisabled({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1.25 text-[11px] font-semibold ${
        active
          ? "border border-blue-100 bg-blue-50 text-blue-600"
          : "border border-slate-200 text-slate-400"
      }`}
    >
      {children}
    </span>
  );
}
