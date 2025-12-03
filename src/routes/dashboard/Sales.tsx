import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useSalesList } from "@/hooks";
import type { SalesListRow } from "@/types/sales-list";
import { SALES_DEAL_STAGE_OPTIONS } from "@/features/deals";
import { formatCurrency } from "@/lib/currency";
import { SalesListSkeleton } from "@/components/ui/skeleton";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const CREATED_RANGE_OPTIONS = [
  { value: "last-30", label: "Last 30 Days" },
  { value: "last-90", label: "Last 90 Days" },
  { value: "last-180", label: "Last 180 Days" },
  { value: "all", label: "Anytime" },
] as const;
const CHANGED_RANGE_OPTIONS = [
  { value: "last-30", label: "Last 30 Days" },
  { value: "last-90", label: "Last 90 Days" },
  { value: "anytime", label: "Anytime" },
] as const;

const MS_PER_DAY = 86_400_000;

function extractParam(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key) || undefined;
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])) {
    return parsed;
  }
  return 25;
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

const rangeToDays: Record<string, number | null> = {
  "last-30": 30,
  "last-90": 90,
  "last-180": 180,
  "last-365": 365,
  all: null,
  anytime: null,
};

function matchesDateRange(dateString: string, rangeKey: string, now: number): boolean {
  const rangeInDays = rangeToDays[rangeKey];
  if (rangeInDays === null) {
    return true;
  }

  const value = new Date(dateString);
  if (Number.isNaN(value.getTime())) {
    return false;
  }

  const differenceInDays = (now - value.getTime()) / MS_PER_DAY;
  return differenceInDays <= rangeInDays;
}

function filterRows(
  rows: SalesListRow[],
  filters: {
    search: string;
    salesperson: string;
    stage: string;
    leadSource: string;
    createdRange: string;
    changedRange: string;
  }
): SalesListRow[] {
  const now = Date.now();
  const rawSearch = filters.search.trim();
  const searchQuery = rawSearch.toLowerCase();
  const numericSearch = rawSearch.replace(/\D+/g, "");

  return rows.filter((row) => {
    if (searchQuery) {
      const searchableValues = [
        row.customerName,
        row.dealName,
        row.leadSource ?? "",
        row.salesperson ?? "",
        row.phoneNumber ?? "",
        row.email ?? "",
      ];

      const hasTextMatch = searchableValues
        .map((value) => value.toLowerCase())
        .some((value) => value.includes(searchQuery));

      const phoneDigits = (row.phoneNumber ?? "").replace(/\D+/g, "");
      const hasPhoneMatch = numericSearch ? phoneDigits.includes(numericSearch) : false;

      if (!hasTextMatch && !hasPhoneMatch) {
        return false;
      }
    }

    if (filters.salesperson && filters.salesperson !== "all") {
      const salesperson = row.salesperson?.toLowerCase();
      if (!salesperson || salesperson !== filters.salesperson.toLowerCase()) {
        return false;
      }
    }

    if (filters.stage && filters.stage !== "all") {
      if (row.stageId !== filters.stage) {
        return false;
      }
    }

    if (filters.leadSource && filters.leadSource !== "all") {
      const leadSource = row.leadSource?.toLowerCase();
      if (!leadSource || leadSource !== filters.leadSource.toLowerCase()) {
        return false;
      }
    }

    if (!matchesDateRange(row.createdAt, filters.createdRange, now)) {
      return false;
    }

    if (!matchesDateRange(row.lastChangeAt, filters.changedRange, now)) {
      return false;
    }

    return true;
  });
}

function formatDate(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDealAge(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return "—";
  }

  const diffDays = Math.max(0, Math.floor((Date.now() - created.getTime()) / MS_PER_DAY));
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1 day";
  }
  if (diffDays < 30) {
    return `${diffDays} days`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) {
    return "1 month";
  }
  if (diffMonths < 12) {
    return `${diffMonths} months`;
  }
  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "1 year" : `${diffYears} years`;
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
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
  }

  const query = params.toString();
  return query ? `/sales?${query}` : `/sales`;
}

export default function SalesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { data, isLoading: salesLoading } = useSalesList(company?.id);

  const rows = data?.rows ?? [];
  const summary = data?.summary ?? null;

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || salesLoading || !summary) {
    return <SalesListSkeleton rows={10} />;
  }

  const search = extractParam(searchParams, "search") ?? "";
  const salesperson = extractParam(searchParams, "salesperson") ?? "all";
  const stage = extractParam(searchParams, "stage") ?? "all";
  const leadSource = extractParam(searchParams, "leadSource") ?? "all";
  const createdRange = extractParam(searchParams, "createdRange") ?? "last-90";
  const changedRange = extractParam(searchParams, "changedRange") ?? "anytime";
  const pageSize = parsePageSize(extractParam(searchParams, "pageSize"));
  const page = parsePage(extractParam(searchParams, "page"));

  const filteredRows = filterRows(rows, {
    search,
    salesperson,
    stage,
    leadSource,
    createdRange,
    changedRange,
  });

  const totalFiltered = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const baseFilters: Record<string, string> = {
    search,
    salesperson,
    stage,
    leadSource,
    createdRange,
    changedRange,
    pageSize: String(pageSize),
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const stageOptions = SALES_DEAL_STAGE_OPTIONS;

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4">
      <header className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-[15px] font-semibold text-slate-900">Sales List</h1>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
              <span>
                <span className="font-semibold text-slate-900">Total Deals:</span>{" "}
                {summary.totalDeals.toLocaleString()}
              </span>
              <span>
                <span className="font-semibold text-slate-900">Total Value:</span>{" "}
                {formatCurrency(summary.totalValue)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <ActionButton label="New Proposal" variant="primary" />
            <ActionButton label="New Appointment" />
            <ActionButton label="New Lead" />
            <ActionButton label="New Request" />
          </div>
        </div>
      </header>

      <form
        method="get"
        className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-nowrap items-end gap-1.5 overflow-x-auto pb-1">
            <FilterSelect
              label="Salesperson"
              name="salesperson"
              defaultValue={salesperson}
              className="w-[150px] flex-shrink-0"
            >
              <option value="all">All Salespeople</option>
              {summary.salespeople.map((value: string) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Labels"
              name="label"
              defaultValue="all"
              disabled
              className="w-[120px] flex-shrink-0"
            >
              <option value="all">All Labels Selected</option>
            </FilterSelect>
            <FilterSelect
              label="Deal Stage"
              name="stage"
              defaultValue={stage}
              className="w-[150px] flex-shrink-0"
            >
              <option value="all">All Deal Stages</option>
              {stageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Lead Source"
              name="leadSource"
              defaultValue={leadSource}
              className="w-[150px] flex-shrink-0"
            >
              <option value="all">All Lead Sources</option>
              {summary.leadSources.map((value: string) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Created Date"
              name="createdRange"
              defaultValue={createdRange}
              className="w-[150px] flex-shrink-0"
            >
              {CREATED_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Changed Date"
              name="changedRange"
              defaultValue={changedRange}
              className="w-[150px] flex-shrink-0"
            >
              {CHANGED_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="submit"
                className="rounded-md bg-accent px-2.5 py-1.25 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                Go
              </button>
              <Link
                to="/sales"
                className="rounded-md border border-slate-200 px-2.5 py-1.25 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Reset
              </Link>
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-1.5 justify-between">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <label htmlFor="sales-search" className="sr-only">
                Search deals
              </label>
              <input
                id="sales-search"
                name="search"
                defaultValue={search}
                placeholder="Search deals"
                className="w-[160px] flex-shrink-0 rounded-md border border-slate-200 px-2 py-1.25 text-[11px] text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-2.5 py-1.25 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <label htmlFor="page-size" className="text-[10px] font-semibold uppercase text-slate-500">
                Show
              </label>
              <select
                id="page-size"
                name="pageSize"
                defaultValue={String(pageSize)}
                className="rounded-md border border-slate-200 px-2 py-1.25 text-[11px] text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500">entries</span>
            </div>
          </div>
        </div>

        <input type="hidden" name="page" value="1" />
      </form>

      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-slate-50">
                <HeaderCell>Label</HeaderCell>
                <HeaderCell>Customer Name</HeaderCell>
                <HeaderCell>Phone Number</HeaderCell>
                <HeaderCell>Lead Source</HeaderCell>
                <HeaderCell>Deal Name</HeaderCell>
                <HeaderCell>Deal Stage</HeaderCell>
                <HeaderCell className="text-right">Deal Amount</HeaderCell>
                <HeaderCell>Last Change</HeaderCell>
                <HeaderCell>Deal Age</HeaderCell>
                <HeaderCell>Salesperson</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-[12px] text-slate-500">
                    No deals match your filters yet.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                    <BodyCell>
                      {row.isArchived ? (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Archived
                        </span>
                      ) : (
                        row.label ?? "—"
                      )}
                    </BodyCell>
                    <BodyCell>{row.customerName}</BodyCell>
                    <BodyCell>{row.phoneNumber ?? "—"}</BodyCell>
                    <BodyCell>{row.leadSource ?? "—"}</BodyCell>
                    <BodyCell>
                      <Link
                        to={`/deals/${row.id}`}
                        className="text-[12px] font-semibold text-blue-600 transition hover:text-blue-700"
                      >
                        {row.dealName}
                      </Link>
                    </BodyCell>
                    <BodyCell>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">
                        {row.stageLabel}
                      </span>
                    </BodyCell>
                    <BodyCell className="text-right font-semibold text-slate-900">
                      {formatCurrency(row.dealAmount)}
                    </BodyCell>
                    <BodyCell>{formatDate(row.lastChangeAt)}</BodyCell>
                    <BodyCell>{formatDealAge(row.createdAt)}</BodyCell>
                    <BodyCell>{row.salesperson ?? "Unassigned"}</BodyCell>
                  </tr>
                ))
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

function ActionButton({ label, variant = "secondary" }: { label: string; variant?: "primary" | "secondary" }) {
  const baseClasses =
    "rounded-md px-2.5 py-1.25 text-[11px] font-semibold shadow-sm transition focus:outline-none focus:ring-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-blue-600 focus:ring-blue-200 border border-transparent"
      : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 focus:ring-blue-200";

  return (
    <button
      type="button"
      className={`${baseClasses} ${styles}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  name,
  defaultValue,
  disabled = false,
  children,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        disabled ? "text-slate-400" : "text-slate-500"
      } ${className ?? ""}`}
    >
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="rounded-md border border-slate-200 bg-white px-2 py-1.25 text-[11px] font-medium text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none disabled:bg-slate-100"
      >
        {children}
      </select>
    </label>
  );
}

function HeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`sticky top-0 z-10 border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function BodyCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-2 text-[12px] text-slate-600 ${className ?? ""}`}>{children}</td>
  );
}

function PaginationLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
    >
      {children}
    </Link>
  );
}

function PaginationDisabled({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "border border-blue-200 bg-blue-50 text-blue-600"
          : "border border-slate-200 text-slate-400"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </span>
  );
}
