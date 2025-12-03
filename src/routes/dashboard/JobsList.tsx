import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useJobsList } from "@/hooks";
import { JobsListFilters } from "@/components/jobs/jobs-list-filters";
import { JOBS_DEAL_STAGE_OPTIONS } from "@/features/deals";
import type { JobsDealStageId } from "@/features/deals";
import {
  JOBS_LIST_PAGE_SIZE_OPTIONS,
  JOBS_LIST_STATUS_LABELS,
  JOBS_LIST_STATUS_OPTIONS,
  JOBS_LIST_STATUS_ORDER,
} from "@/constants/jobs-list";
import { INVOICE_STATUS_LABELS } from "@/constants/invoices-list";
import { formatCurrency } from "@/lib/currency";
import { JobsListSkeleton } from "@/components/ui/skeleton";
import type { JobsListRow, JobsListStatus } from "@/types/jobs-list";

const jobStageIdSet = new Set(JOBS_DEAL_STAGE_OPTIONS.map((stage) => stage.id));
const jobStatusSet = new Set(JOBS_LIST_STATUS_ORDER);

const STATUS_BADGE_CLASSES: Record<JobsListStatus, string> = {
  none: "border border-slate-200 bg-slate-100 text-slate-600",
  draft: "border border-slate-200 bg-slate-100 text-slate-600",
  sent: "border border-sky-200 bg-sky-100 text-sky-700",
  accepted: "border border-emerald-200 bg-emerald-100 text-emerald-700",
  declined: "border border-rose-200 bg-rose-100 text-rose-700",
};

function extractParam(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key) || undefined;
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (JOBS_LIST_PAGE_SIZE_OPTIONS.includes(parsed as (typeof JOBS_LIST_PAGE_SIZE_OPTIONS)[number])) {
    return parsed;
  }
  return JOBS_LIST_PAGE_SIZE_OPTIONS[0];
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseStatus(value: string | undefined): JobsListStatus | "all" {
  if (!value) {
    return "all";
  }
  return jobStatusSet.has(value as JobsListStatus) ? (value as JobsListStatus) : "all";
}

function parseStage(value: string | undefined): JobsDealStageId | "all" {
  if (!value) {
    return "all";
  }
  return jobStageIdSet.has(value as JobsDealStageId) ? (value as JobsDealStageId) : "all";
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
  return query ? `/jobs/list?${query}` : `/jobs/list`;
}

function matchesSearch(row: JobsListRow, search: string, numericSearch: string): boolean {
  if (!search && !numericSearch) {
    return true;
  }

  const textFields = [
    row.customerName,
    row.dealName,
    row.jobAddress ?? "",
    row.invoiceNumber ?? "",
    row.quoteNumber ?? "",
    row.email ?? "",
  ].map((value) => value.toLowerCase());

  const hasTextMatch = search ? textFields.some((value) => value.includes(search)) : false;

  const numericHaystacks = [
    row.phone ?? "",
    row.invoiceNumber ?? "",
    row.quoteNumber ?? "",
  ].map((value) => value.replace(/\D+/g, ""));

  const hasNumericMatch = numericSearch
    ? numericHaystacks.some((value) => value.includes(numericSearch))
    : false;

  return hasTextMatch || hasNumericMatch;
}

function toTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatStageDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const timestamp = toTimestamp(value);
  if (timestamp === 0) {
    return "—";
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }
  const timestamp = toTimestamp(value);
  if (timestamp === 0) {
    return "—";
  }
  return new Date(timestamp).toLocaleString();
}

function formatInvoiceNumber(value: string | null): string {
  if (!value) {
    return "—";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  return `#${withoutHash}`;
}

function formatCurrencyValue(value: number | null): string {
  if (!Number.isFinite(value ?? NaN)) {
    return "—";
  }
  return formatCurrency(value ?? 0);
}

export default function JobsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { data, isLoading: jobsLoading } = useJobsList(company?.id);

  const rows = data?.rows ?? [];
  const summary = data?.summary ?? null;

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || jobsLoading || !summary) {
    return <JobsListSkeleton rows={10} />;
  }

  const searchRaw = (extractParam(searchParams, "search") ?? "").trim();
  const status = parseStatus(extractParam(searchParams, "status"));
  const stage = parseStage(extractParam(searchParams, "stage"));
  const pageSize = parsePageSize(extractParam(searchParams, "pageSize"));
  const requestedPage = parsePage(extractParam(searchParams, "page"));

  const search = searchRaw.toLowerCase();
  const numericSearch = searchRaw.replace(/\D+/g, "");

  const filteredRows = rows.filter((row) => {
    if (!matchesSearch(row, search, numericSearch)) {
      return false;
    }

    if (status !== "all" && row.status !== status) {
      return false;
    }

    if (stage !== "all" && row.stageId !== stage) {
      return false;
    }

    return true;
  });

  const sortedRows = filteredRows
    .slice()
    .sort((a, b) => toTimestamp(b.stageUpdatedAt) - toTimestamp(a.stageUpdatedAt));

  const totalFiltered = sortedRows.length;
  const totalPages = totalFiltered === 0 ? 1 : Math.ceil(totalFiltered / pageSize);
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const startIndex = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = totalFiltered === 0 ? 0 : Math.min(startIndex + pageSize, totalFiltered);
  const paginatedRows = sortedRows.slice(startIndex, startIndex + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const baseFilters: Record<string, string> = {
    search: searchRaw,
    status: status !== "all" ? status : "",
    stage: stage !== "all" ? stage : "",
    pageSize: String(pageSize),
  };

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4">
      <header className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-[15px] font-semibold text-slate-900">Jobs List</h1>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
              <span>
                <span className="font-semibold text-slate-900">Total Jobs:</span>{" "}
                {summary.totalJobs.toLocaleString()}
              </span>
              <span>
                <span className="font-semibold text-slate-900">Booked Value:</span>{" "}
                {formatCurrency(summary.totalValue)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <JobsListFilters
        search={searchRaw}
        status={status}
        stage={stage}
        statusOptions={JOBS_LIST_STATUS_OPTIONS}
        stageOptions={JOBS_DEAL_STAGE_OPTIONS}
        pageSize={pageSize}
        pageSizeOptions={JOBS_LIST_PAGE_SIZE_OPTIONS}
        resetHref="/jobs/list"
      />

      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-slate-50">
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Job</HeaderCell>
                <HeaderCell>First Name</HeaderCell>
                <HeaderCell>Last Name</HeaderCell>
                <HeaderCell>Proposal ID</HeaderCell>
                <HeaderCell>Invoice ID</HeaderCell>
                <HeaderCell>Invoice Status</HeaderCell>
                <HeaderCell className="text-right">Amount</HeaderCell>
                <HeaderCell className="text-right">Paid</HeaderCell>
                <HeaderCell className="text-right">Balance</HeaderCell>
                <HeaderCell>Deal Stage</HeaderCell>
                <HeaderCell>Deal Stage Date</HeaderCell>
                <HeaderCell>Proposal Signed Date</HeaderCell>
                <HeaderCell>Job Schedule Date</HeaderCell>
                <HeaderCell>Job Start Date</HeaderCell>
                <HeaderCell>Job Completion Date</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-4 py-8 text-center text-[12px] text-slate-500">
                    No jobs match your filters yet.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const statusLabel = JOBS_LIST_STATUS_LABELS[row.status];
                  const invoiceStatusLabel = row.invoiceStatus
                    ? INVOICE_STATUS_LABELS[row.invoiceStatus] ?? row.invoiceStatus
                    : "—";

                  return (
                    <tr key={row.dealId} className="border-b border-slate-100 last:border-b-0">
                      <BodyCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${STATUS_BADGE_CLASSES[row.status]}`}
                        >
                          {statusLabel.toUpperCase()}
                        </span>
                      </BodyCell>
                      <BodyCell>
                        <div className="flex flex-col">
                          <Link
                            to={`/deals/${row.dealId}`}
                            className="text-[12px] font-semibold text-blue-600 transition hover:text-blue-700"
                          >
                            {row.customerName}
                          </Link>
                          <span className="text-[10px] text-slate-500">{row.jobAddress ?? "—"}</span>
                        </div>
                      </BodyCell>
                      <BodyCell>{row.firstName || "—"}</BodyCell>
                      <BodyCell>{row.lastName || "—"}</BodyCell>
                      <BodyCell>{row.quoteNumber ?? "—"}</BodyCell>
                      <BodyCell>{formatInvoiceNumber(row.invoiceNumber)}</BodyCell>
                      <BodyCell>{invoiceStatusLabel}</BodyCell>
                      <BodyCell className="text-right font-semibold text-slate-900">
                        {formatCurrencyValue(row.invoiceTotal)}
                      </BodyCell>
                      <BodyCell className="text-right">{formatCurrencyValue(row.invoiceAmountPaid)}</BodyCell>
                      <BodyCell className="text-right">{formatCurrencyValue(row.invoiceBalanceDue)}</BodyCell>
                      <BodyCell>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {row.stageLabel}
                        </span>
                      </BodyCell>
                      <BodyCell>{formatStageDate(row.stageUpdatedAt)}</BodyCell>
                      <BodyCell>{formatDateTime(row.quoteSignedAt)}</BodyCell>
                      <BodyCell>{formatDateTime(row.jobScheduleDate)}</BodyCell>
                      <BodyCell>{formatDateTime(row.jobStartDate)}</BodyCell>
                      <BodyCell>{formatDateTime(row.jobCompletionDate)}</BodyCell>
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
                <PaginationLink
                  key={pageNumber}
                  to={buildFiltersQuery(baseFilters, { page: pageNumber })}
                >
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

function HeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function BodyCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-[11px] text-slate-700 ${className ?? ""}`}>{children}</td>;
}

function PaginationLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100"
    >
      {children}
    </Link>
  );
}

function PaginationDisabled({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
        active ? "border border-blue-200 bg-blue-50 text-blue-600" : "text-slate-400"
      }`}
    >
      {children}
    </span>
  );
}
