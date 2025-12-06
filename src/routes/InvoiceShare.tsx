import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "@/services/api";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { ReadOnlyLineItemRow } from "@/components/shared/line-item-card";
import type { InvoiceShareSnapshot } from "@/types/invoice-shares";

function formatAddress(address: {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
} | null): string | null {
  if (!address) {
    return null;
  }

  const segments = [
    address.address_line1,
    address.address_line2,
    [address.city, address.state].filter(Boolean).join(", ") || null,
    address.postal_code,
  ]
    .flat()
    .map((value) => (value ?? "").trim())
    .filter(Boolean);

  return segments.length > 0 ? segments.join("\n") : null;
}

const formatDisplayDate = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function InvoiceSharePage() {
  const params = useParams();
  const navigate = useNavigate();
  const shareId = params.shareId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InvoiceShareSnapshot | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const payload = await apiClient<any>(`/invoices/share/${encodeURIComponent(shareId)}`);

        if (!payload?.invoiceShare) {
          navigate("/");
          return;
        }

        setData(payload.invoiceShare);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load invoice share:", error);
        navigate("/");
      }
    }

    loadData();
  }, [shareId, navigate]);

  if (loading) {
    return <LoadingPage message="Loading invoice..." />;
  }

  if (!data) {
    return null;
  }

  const { invoice, company, customer, propertyAddress } = data;
  const issueDate = formatDisplayDate(invoice.issue_date);
  const dueDate = formatDisplayDate(invoice.due_date);

  const totals = invoice.line_items.reduce(
    (acc, item) => {
      const lineTotal = item.quantity * item.unit_price;
      return {
        subtotal: acc.subtotal + lineTotal,
        total: acc.total + lineTotal,
      };
    },
    { subtotal: 0, total: 0 }
  );

  const balanceDue = invoice.balance_due ?? totals.total;

  const companyDisplayName = company?.physical_company_name ?? company?.name ?? "";
  const companyContactEmail = company?.email ?? null;
  const companyContactPhone = company?.phone_number ?? null;
  const companyWebsite = company?.website ?? null;
  const companyReviewUrl = company?.review_url ?? null;
  const companyLogoUrl = (company as { logo_url?: string | null } | null)?.logo_url ?? null;
  const companyWebsiteDisplay = companyWebsite
    ? companyWebsite.replace(/^https?:\/\//i, "")
    : null;
  const companyAddress = formatAddress({
    address_line1: company?.physical_address_line1 ?? null,
    address_line2: company?.physical_address_line2 ?? null,
    city: company?.physical_city ?? null,
    state: company?.physical_state ?? null,
    postal_code: company?.physical_zip ?? null,
  });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sticky header with balance due */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Balance Due</p>
            <p className="text-2xl font-semibold text-slate-900">{formatCurrency(balanceDue)}</p>
          </div>
          <div className="self-end sm:self-auto">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              {dueDate ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Due </span>
                  <span className="font-medium text-slate-900">{dueDate}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-12 pt-10">
        <div className="rounded-2xl bg-white px-6 py-8 shadow-xl">
          <header className="border-b border-slate-200 pb-6">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoice #{invoice.invoice_number}
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                  Invoice
                </h1>
                <p className="mt-2 text-sm text-slate-600">Prepared for {customer.name}</p>
                {issueDate ? (
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Issued {issueDate}
                  </p>
                ) : null}
              </div>
              <div className="text-sm text-slate-600">
                <div className="flex items-center justify-end">
                  {companyLogoUrl ? (
                    <img
                      src={companyLogoUrl}
                      alt={`${companyDisplayName || "Company"} logo`}
                      className="h-12 w-auto max-w-[140px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="mt-4 space-y-1 text-right">
                  {companyDisplayName ? (
                    <p className="font-semibold text-slate-900">{companyDisplayName}</p>
                  ) : null}
                  {companyContactPhone ? <p>{companyContactPhone}</p> : null}
                  {companyContactEmail ? <p>{companyContactEmail}</p> : null}
                  {companyWebsite ? (
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-end gap-1 text-blue-600 underline underline-offset-2"
                    >
                      <span>Website</span>
                      {companyWebsiteDisplay ? (
                        <span className="text-[11px] text-blue-500">({companyWebsiteDisplay})</span>
                      ) : null}
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="col-span-full grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Bill To</p>
                  <p>{customer.name}</p>
                  <div className="mt-2 space-y-1">
                    <p>{customer.email ?? "No email provided"}</p>
                    <p>{customer.phone ?? "No phone provided"}</p>
                  </div>
                  {propertyAddress ? (
                    <p className="mt-2 whitespace-pre-line text-slate-500">{propertyAddress}</p>
                  ) : null}
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">From</p>
                  <p>{companyDisplayName}</p>
                  <div className="mt-2 space-y-1">
                    <p>{companyContactEmail ?? ""}</p>
                    <p>{companyContactPhone ?? ""}</p>
                  </div>
                  {companyAddress ? (
                    <p className="mt-2 whitespace-pre-line text-slate-500">{companyAddress}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <section className="mt-6">
            <div className="divide-y divide-slate-100">
              {invoice.line_items.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No line items added yet.
                </p>
              ) : (
                invoice.line_items.map((item) => (
                  <ReadOnlyLineItemRow
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.quantity * item.unit_price}
                  />
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-xs space-y-1 text-right text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
                {balanceDue !== totals.total && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Balance Due</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {invoice.notes ? (
            <section className="mt-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Notes</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{invoice.notes}</p>
              </div>
            </section>
          ) : null}

          {companyReviewUrl ? (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <p className="font-semibold text-amber-900">Love our work?</p>
              <p className="mt-1">
                <a
                  href={companyReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 underline underline-offset-2"
                >
                  Leave us a review
                </a>
              </p>
            </section>
          ) : null}

          <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            <p>Sent via ServiceFlow • Invoice #{invoice.invoice_number}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
