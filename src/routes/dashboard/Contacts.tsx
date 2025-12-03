import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import {
  useContactsPaginated,
  ContactListFilters,
  type ContactRecord,
} from "@/features/contacts";
import {
  CONTACT_LIST_PAGE_SIZE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  CONTACT_TYPE_OPTIONS,
} from "@/constants/contact-list";
import { formatCurrency } from "@/lib/currency";
import { ContactListSkeleton } from "@/components/ui/skeleton";

function extractParam(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key) || undefined;
}

function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (CONTACT_LIST_PAGE_SIZE_OPTIONS.includes(parsed as (typeof CONTACT_LIST_PAGE_SIZE_OPTIONS)[number])) {
    return parsed;
  }
  return CONTACT_LIST_PAGE_SIZE_OPTIONS[0];
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

function formatContactName(contact: ContactRecord): string {
  return `${contact.first_name} ${contact.last_name || ""}`.trim();
}

function formatAddress(contact: ContactRecord): string | null {
  const primaryAddress = contact.addresses?.find((a) => a.address_line1);
  if (!primaryAddress) return null;

  const parts = [
    primaryAddress.address_line1,
    primaryAddress.city,
    primaryAddress.state,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

// Generate pagination page numbers with ellipsis for large page counts
function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  // Show pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export default function ContactsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();

  // Parse URL params
  const search = (extractParam(searchParams, "search") ?? "").trim();
  const type = (extractParam(searchParams, "type") ?? "all").toLowerCase();
  const source = (extractParam(searchParams, "source") ?? "all").toLowerCase();
  const salesperson = (extractParam(searchParams, "salesperson") ?? "all").toLowerCase();
  const status = (extractParam(searchParams, "status") ?? "all").toLowerCase();
  const showArchived = extractParam(searchParams, "showArchived") === "1";
  const pageSize = parsePageSize(extractParam(searchParams, "pageSize"));
  const currentPage = parsePage(extractParam(searchParams, "page"));

  // Fetch paginated contacts from server
  const { data, isLoading: contactsLoading, isFetching } = useContactsPaginated(
    company?.id,
    {
      page: currentPage,
      pageSize,
      search: search || undefined,
      showArchived,
    }
  );

  const contacts = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, pageSize, totalCount: 0, totalPages: 1 };
  const summary = data?.summary ?? { invalidPhoneCount: 0, totalContacts: 0, sources: [], salespeople: [] };

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  // Calculate display values
  const totalFiltered = pagination.totalCount;
  const totalPages = pagination.totalPages;
  const startIndex = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = totalFiltered === 0 ? 0 : Math.min(currentPage * pageSize, totalFiltered);
  const pageNumbers = useMemo(() => getPageNumbers(currentPage, totalPages), [currentPage, totalPages]);

  const baseFilters: Record<string, string> = {
    search,
    type: type !== "all" ? type : "",
    source: source !== "all" ? source : "",
    salesperson: salesperson !== "all" ? salesperson : "",
    status: status !== "all" ? status : "",
    pageSize: String(pageSize),
    showArchived: showArchived ? "1" : "",
  };

  const invalidPhoneCount = summary.invalidPhoneCount;
  const invalidPhoneDescription = invalidPhoneCount === 1 ? "record" : "records";

  // Show skeleton on initial load
  if (authLoading || (contactsLoading && !data)) {
    return <ContactListSkeleton rows={10} />;
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-slate-900">Contact List</h1>
          <p className="text-[11px] text-slate-500">
            You have {invalidPhoneCount} invalid phone contact {invalidPhoneDescription}.
          </p>
        </div>
      </header>

      <ContactListFilters
        search={search}
        typeValue={type}
        sourceValue={source}
        salespersonValue={salesperson}
        statusValue={status}
        showArchived={showArchived}
        pageSize={pageSize}
        pageSizeOptions={CONTACT_LIST_PAGE_SIZE_OPTIONS}
        typeOptions={CONTACT_TYPE_OPTIONS}
        sourceOptions={summary.sources}
        salespersonOptions={summary.salespeople}
        statusOptions={CONTACT_STATUS_OPTIONS}
        resetHref="/contacts"
      />

      <section className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className={`flex-1 overflow-x-auto overflow-y-auto ${isFetching ? "opacity-60" : ""}`}>
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-slate-50">
                <HeaderCell>Customer</HeaderCell>
                <HeaderCell>Email</HeaderCell>
                <HeaderCell>Phone</HeaderCell>
                <HeaderCell>Type</HeaderCell>
                <HeaderCell>Source</HeaderCell>
                <HeaderCell>Address</HeaderCell>
                <HeaderCell>Salesperson</HeaderCell>
                <HeaderCell className="text-right">Balance</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[12px] text-slate-500">
                    No contacts match your filters yet.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const name = formatContactName(contact);
                  const address = formatAddress(contact);
                  const isArchived = contact.archived;
                  return (
                    <tr key={contact.id} className="border-b border-slate-100 last:border-b-0">
                      <BodyCell>
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="text-[12px] font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          {name}
                        </Link>
                        {isArchived ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Archived
                          </span>
                        ) : null}
                      </BodyCell>
                      <BodyCell>{contact.email ?? "—"}</BodyCell>
                      <BodyCell>{contact.phone ?? "—"}</BodyCell>
                      <BodyCell className="capitalize">lead</BodyCell>
                      <BodyCell>—</BodyCell>
                      <BodyCell>{address ?? "—"}</BodyCell>
                      <BodyCell>—</BodyCell>
                      <BodyCell className="text-right font-semibold text-slate-900">
                        {formatCurrency(0)}
                      </BodyCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[11px] text-slate-600 border-t border-slate-100">
          <p>
            Showing {startIndex} to {endIndex} of {totalFiltered} entries
            {isFetching && <span className="ml-2 text-slate-400">(loading...)</span>}
          </p>
          <div className="flex items-center gap-1.5">
            {currentPage > 1 ? (
              <PaginationLink to={buildFiltersQuery(baseFilters, { page: currentPage - 1 })}>
                Prev
              </PaginationLink>
            ) : (
              <PaginationDisabled>Prev</PaginationDisabled>
            )}

            {pageNumbers.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">
                  ...
                </span>
              ) : pageNumber === currentPage ? (
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
