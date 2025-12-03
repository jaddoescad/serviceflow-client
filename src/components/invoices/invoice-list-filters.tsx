import { Link } from "react-router-dom";
import type { InvoiceStatus } from "@/features/invoices";
import { Button, Input, Select } from "@/components/ui/library";

export type InvoiceListFiltersProps = {
  search: string;
  status: InvoiceStatus | "all";
  statusOptions: ReadonlyArray<InvoiceStatus>;
  pageSize: number;
  pageSizeOptions: readonly number[];
  resetHref: string;
  statusLabels: Record<InvoiceStatus, string>;
};

export function InvoiceListFilters({
  search,
  status,
  statusOptions,
  pageSize,
  pageSizeOptions,
  resetHref,
  statusLabels,
}: InvoiceListFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Search"
          name="search"
          defaultValue={search}
          placeholder="Search invoices"
          size="sm"
        />

        <Select label="Status" name="status" defaultValue={status} size="sm">
          <option value="all">All</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option] ?? option}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="invoice-page-size"
            className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"
          >
            Show
          </label>
          <select
            id="invoice-page-size"
            name="pageSize"
            defaultValue={String(pageSize)}
            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
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
          <Button type="submit" variant="primary" size="xs">
            Apply filters
          </Button>
          <Link
            to={resetHref}
            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            Reset
          </Link>
        </div>
      </div>

      <input type="hidden" name="page" value="1" />
    </form>
  );
}
