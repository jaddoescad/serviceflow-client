import { Link } from "react-router-dom";
import type { ContactStatusOption, ContactTypeOption } from "../types";

export type ContactListFiltersProps = {
  search: string;
  typeValue: string;
  sourceValue: string;
  salespersonValue: string;
  statusValue: string;
  showArchived: boolean;
  pageSize: number;
  pageSizeOptions: readonly number[];
  typeOptions: ReadonlyArray<ContactTypeOption>;
  sourceOptions: readonly string[];
  salespersonOptions: readonly string[];
  statusOptions: ReadonlyArray<ContactStatusOption>;
  resetHref: string;
};

const labelClasses =
  "text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500";
const inputClasses =
  "mt-1.5 w-full rounded-md border border-slate-200 px-2.5 py-1.25 text-[11px] text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none";

export function ContactListFilters({
  search,
  typeValue,
  sourceValue,
  salespersonValue,
  statusValue,
  showArchived,
  pageSize,
  pageSizeOptions,
  typeOptions,
  sourceOptions,
  salespersonOptions,
  statusOptions,
  resetHref,
}: ContactListFiltersProps) {
  return (
    <form
      method="get"
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="flex flex-col">
          <span className={labelClasses}>Search</span>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search contacts"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col">
          <span className={labelClasses}>Type</span>
          <select name="type" defaultValue={typeValue} className={inputClasses}>
            <option value="all">All types</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className={labelClasses}>Source</span>
          <select
            name="source"
            defaultValue={sourceValue}
            className={inputClasses}
          >
            <option value="all">All sources</option>
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className={labelClasses}>Salesperson</span>
          <select
            name="salesperson"
            defaultValue={salespersonValue}
            className={inputClasses}
          >
            <option value="all">All salespeople</option>
            {salespersonOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className={labelClasses}>Status</span>
          <select
            name="status"
            defaultValue={statusValue}
            className={inputClasses}
          >
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col justify-end">
          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.75 text-[11px] font-semibold text-slate-600 shadow-sm">
            <input
              type="checkbox"
              name="showArchived"
              value="1"
              defaultChecked={showArchived}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Show archived
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <label htmlFor="contacts-page-size" className={labelClasses}>
            Show
          </label>
          <select
            id="contacts-page-size"
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
          <span className="text-[10px] uppercase tracking-[0.08em] text-slate-500">
            entries
          </span>
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
