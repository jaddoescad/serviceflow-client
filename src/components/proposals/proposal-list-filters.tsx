import { Link } from "react-router-dom";
import type { QuoteStatus } from "@/types/quotes";

export type ProposalListFiltersProps = {
  search: string;
  status: QuoteStatus | "all";
  statusOptions: ReadonlyArray<QuoteStatus>;
  pageSize: number;
  pageSizeOptions: readonly number[];
  resetHref: string;
  statusLabels: Record<QuoteStatus, string>;
};

const labelClasses = "text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500";
const inputClasses =
  "mt-1.5 w-full rounded-md border border-slate-200 px-2.5 py-1.25 text-[11px] text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none";

export function ProposalListFilters({
  search,
  status,
  statusOptions,
  pageSize,
  pageSizeOptions,
  resetHref,
  statusLabels,
}: ProposalListFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col">
          <span className={labelClasses}>Search</span>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search proposals"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col">
          <span className={labelClasses}>Status</span>
          <select name="status" defaultValue={status} className={inputClasses}>
            <option value="all">All</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabels[option] ?? option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <label htmlFor="proposal-page-size" className={labelClasses}>
            Show
          </label>
          <select
            id="proposal-page-size"
            name="pageSize"
            defaultValue={String(pageSize)}
            className="rounded-md border border-slate-200 px-2 py-1.25 text-[11px] text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          >
            {pageSizeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span className="text-[10px] uppercase tracking-[0.08em] text-slate-500">entries</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-2.5 py-1.25 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Apply filters
          </button>
          <Link
            to={resetHref}
            className="rounded-md border border-slate-200 px-2.5 py-1.25 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            Reset
          </Link>
        </div>
      </div>

      <input type="hidden" name="page" value="1" />
    </form>
  );
}
