type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className = "", lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ className = "", size = "md" }: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return <Skeleton className={`rounded-full ${sizes[size]} ${className}`} />;
}

// Table skeleton for contact list, invoices, etc.
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="flex flex-col" role="status" aria-label="Loading table data">
      <span className="sr-only">Loading...</span>
      {/* Header */}
      <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 border-b border-slate-100 px-4 py-4"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 flex-1 ${colIndex === 0 ? "max-w-[180px]" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card skeleton for kanban cards
export function CardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`flex flex-col gap-2 rounded border border-slate-200 bg-white px-3 py-3 shadow-sm ${className}`}
      role="status"
      aria-label="Loading card"
    >
      <span className="sr-only">Loading...</span>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="mt-1 flex justify-end">
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Kanban column skeleton
export function KanbanColumnSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="flex h-full min-w-[240px] flex-col rounded-lg border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-3 py-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2.5 py-2.5">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Full kanban board skeleton
export function KanbanBoardSkeleton({ columns = 4, cardsPerColumn = 3 }: { columns?: number; cardsPerColumn?: number }) {
  return (
    <div className="flex w-full flex-col gap-3" role="status" aria-label="Loading pipeline">
      <span className="sr-only">Loading pipeline...</span>
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      {/* Columns */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <KanbanColumnSkeleton key={i} cards={cardsPerColumn} />
        ))}
      </div>
    </div>
  );
}

// Contact list page skeleton
export function ContactListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading contacts">
      <span className="sr-only">Loading contacts...</span>
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </header>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
      </div>
      {/* Table */}
      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <TableSkeleton rows={rows} columns={8} />
      </section>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading form">
      <span className="sr-only">Loading form...</span>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full rounded" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-9 w-20 rounded" />
        <Skeleton className="h-9 w-24 rounded" />
      </div>
    </div>
  );
}

// Dashboard stats skeleton
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" role="status" aria-label="Loading stats">
      <span className="sr-only">Loading stats...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

// Deal detail skeleton
export function DealDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4" role="status" aria-label="Loading deal details">
      <span className="sr-only">Loading deal details...</span>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </div>
      {/* Content sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-32" />
          <FormSkeleton fields={3} />
        </div>
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-32" />
          <FormSkeleton fields={3} />
        </div>
      </div>
    </div>
  );
}

// Invoice list page skeleton
export function InvoiceListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading invoices">
      <span className="sr-only">Loading invoices...</span>
      {/* Header */}
      <header className="flex flex-col gap-1">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-72" />
      </header>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48 rounded" />
        <Skeleton className="h-9 w-32 rounded" />
        <Skeleton className="h-9 w-24 rounded" />
      </div>
      {/* Table */}
      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <TableSkeleton rows={rows} columns={8} />
      </section>
    </div>
  );
}

// Proposal list page skeleton
export function ProposalListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading proposals">
      <span className="sr-only">Loading proposals...</span>
      {/* Header */}
      <header className="flex flex-col gap-1">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-48" />
      </header>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48 rounded" />
        <Skeleton className="h-9 w-32 rounded" />
        <Skeleton className="h-9 w-24 rounded" />
      </div>
      {/* Table */}
      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <TableSkeleton rows={rows} columns={8} />
      </section>
    </div>
  );
}

// Jobs list page skeleton
export function JobsListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading jobs">
      <span className="sr-only">Loading jobs...</span>
      {/* Header with stats */}
      <header className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </header>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48 rounded" />
        <Skeleton className="h-9 w-32 rounded" />
        <Skeleton className="h-9 w-32 rounded" />
        <Skeleton className="h-9 w-24 rounded" />
      </div>
      {/* Table */}
      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <TableSkeleton rows={rows} columns={12} />
      </section>
    </div>
  );
}

// Products page skeleton
export function ProductsPageSkeleton() {
  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-4" role="status" aria-label="Loading products">
      <span className="sr-only">Loading products...</span>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded" />
      </div>
      {/* Product grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Users page skeleton
export function UsersPageSkeleton() {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-3" role="status" aria-label="Loading users">
      <span className="sr-only">Loading users...</span>
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-1 h-3 w-56" />
        </div>
      </header>
      {/* User list */}
      <div className="flex flex-1 min-h-0 flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <SkeletonCircle size="lg" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Crews page skeleton
export function CrewsPageSkeleton() {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4 p-4" role="status" aria-label="Loading crews">
      <span className="sr-only">Loading crews...</span>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-9 w-28 rounded" />
      </div>
      {/* Crew cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <SkeletonCircle size="md" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-2">
              <SkeletonCircle size="sm" />
              <SkeletonCircle size="sm" />
              <SkeletonCircle size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Appointments calendar skeleton
export function AppointmentsCalendarSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4" role="status" aria-label="Loading appointments">
      <span className="sr-only">Loading appointments...</span>
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded" />
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-5 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 rounded border border-slate-100 bg-white p-2"
          >
            <Skeleton className="h-4 w-6" />
            {i % 4 === 0 && <Skeleton className="h-3 w-full" />}
            {i % 6 === 0 && <Skeleton className="h-3 w-3/4" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// Drips management page skeleton
export function DripsManagementSkeleton() {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4 p-4" role="status" aria-label="Loading drip sequences">
      <span className="sr-only">Loading drip sequences...</span>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-36 rounded" />
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
      {/* Sequence cards */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sales list page skeleton (with stats header)
export function SalesListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading sales">
      <span className="sr-only">Loading sales...</span>
      {/* Stats header */}
      <StatsSkeleton count={2} />
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-36 rounded" />
          <Skeleton className="h-9 w-32 rounded" />
          <Skeleton className="h-9 w-36 rounded" />
          <Skeleton className="h-9 w-36 rounded" />
          <Skeleton className="h-9 w-16 rounded" />
        </div>
      </div>
      {/* Table */}
      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <TableSkeleton rows={rows} columns={10} />
      </section>
    </div>
  );
}

// Contact detail page skeleton
export function ContactDetailSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-6" role="status" aria-label="Loading contact">
      <span className="sr-only">Loading contact...</span>
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </header>
      {/* Contact details card */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Company settings page skeleton
export function CompanySettingsSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading settings">
      <span className="sr-only">Loading settings...</span>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Navigation tabs */}
        <nav className="flex flex-wrap items-center gap-1.5 pb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </nav>
        {/* Content area */}
        <div className="flex-1 space-y-4 pt-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full max-w-md rounded" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-9 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Communication templates page skeleton
export function CommunicationTemplatesSkeleton() {
  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4" role="status" aria-label="Loading templates">
      <span className="sr-only">Loading templates...</span>
      {/* Header */}
      <header className="flex flex-col gap-1">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-3 w-80" />
      </header>
      {/* Template list */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Deal detail page skeleton (the DealDetailBoard view)
export function DealDetailPageSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 p-4" role="status" aria-label="Loading deal">
      <span className="sr-only">Loading deal...</span>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-28 rounded" />
        </div>
      </div>
      {/* Two column layout */}
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left column - main content */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded border border-slate-100 p-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right column - sidebar */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quote/Proposal form page skeleton
export function QuoteFormSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50" role="status" aria-label="Loading quote">
      <span className="sr-only">Loading quote...</span>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded" />
            <Skeleton className="h-9 w-24 rounded" />
          </div>
        </div>
        {/* Client info card */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-28 mb-3" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        {/* Line items */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 pb-3">
                <Skeleton className="h-10 flex-1 rounded" />
                <Skeleton className="h-10 w-20 rounded" />
                <Skeleton className="h-10 w-24 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <div className="space-y-2">
              <div className="flex justify-between gap-8">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between gap-8">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Invoice detail page skeleton
export function InvoiceDetailPageSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50" role="status" aria-label="Loading invoice">
      <span className="sr-only">Loading invoice...</span>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded" />
            <Skeleton className="h-9 w-32 rounded" />
          </div>
        </div>
        {/* Invoice card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex justify-between mb-6">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          {/* Line items */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex gap-4 text-sm font-medium text-slate-500 mb-2">
              <Skeleton className="h-3 w-48 flex-1" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-slate-100">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Organization select page skeleton
export function OrganizationSelectSkeleton() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12" role="status" aria-label="Loading organizations">
      <span className="sr-only">Loading organizations...</span>
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20 mt-0.5" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </div>
      {/* Organization cards */}
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto mt-2" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard layout skeleton - shows header, sidebar, and content area skeleton
export function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col bg-slate-50" role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard...</span>
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded" />
          <SkeletonCircle size="sm" />
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-3 lg:block">
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </aside>
        {/* Main content area - shows kanban skeleton by default */}
        <main className="flex flex-1 min-h-0 flex-col overflow-hidden p-4">
          <KanbanBoardSkeleton columns={5} cardsPerColumn={3} />
        </main>
      </div>
    </div>
  );
}

// Minimal full-page loading skeleton - used as top-level Suspense fallback
export function PageLoadingSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50" role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// Deal detail layout skeleton - header with back button and content area
export function DealDetailLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col bg-slate-50" role="status" aria-label="Loading deal">
      <span className="sr-only">Loading deal...</span>
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-5 w-48" />
      </header>
      {/* Content */}
      <main className="flex flex-1 min-h-0 flex-col overflow-hidden">
        <QuoteFormSkeleton />
      </main>
    </div>
  );
}
