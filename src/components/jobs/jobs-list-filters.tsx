import { Link } from "react-router-dom";
import type { JobsDealStageId } from "@/features/deals";
import type { JobsListStatus } from "@/types/jobs-list";
import { Button, Input, Select } from "@/components/ui/library";

export type JobsListFiltersProps = {
  search: string;
  status: JobsListStatus | "all";
  stage: JobsDealStageId | "all";
  statusOptions: ReadonlyArray<{ id: JobsListStatus; label: string }>;
  stageOptions: ReadonlyArray<{ id: JobsDealStageId; label: string }>;
  pageSize: number;
  pageSizeOptions: readonly number[];
  resetHref: string;
};

export function JobsListFilters({
  search,
  status,
  stage,
  statusOptions,
  stageOptions,
  pageSize,
  pageSizeOptions,
  resetHref,
}: JobsListFiltersProps) {
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
          placeholder="Search jobs"
          size="sm"
        />

        <Select label="Status" name="status" defaultValue={status} size="sm">
          <option value="all">All</option>
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select label="Deal Stage" name="stage" defaultValue={stage} size="sm">
          <option value="all">All</option>
          {stageOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="jobs-page-size"
            className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500"
          >
            Show
          </label>
          <select
            id="jobs-page-size"
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
