import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { apiClient } from "@/services/api";
import { LoadingPage } from "@/components/ui/loading-spinner";
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
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <header className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                  {invoice.title.trim() || `Invoice ${invoice.invoice_number}`}
                </h1>
                <dl className="mt-3 space-y-1 text-[13px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-slate-500">Invoice #</dt>
                    <dd>{invoice.invoice_number}</dd>
                  </div>
                  {issueDate ? (
                    <div className="flex items-center gap-2">
                      <dt className="font-medium text-slate-500">Issued</dt>
                      <dd>{issueDate}</dd>
                    </div>
                  ) : null}
                  {dueDate ? (
                    <div className="flex items-center gap-2">
                      <dt className="font-medium text-slate-500">Due</dt>
                      <dd>{dueDate}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="flex items-center justify-center">
                  {companyLogoUrl ? (
                    <img
                      src={companyLogoUrl}
                      alt={`${companyDisplayName || "Company"} logo`}
                      className="h-12 w-auto max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold uppercase text-white">
                      {(companyDisplayName || "Company").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
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
                      className="mt-1 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2"
                    >
                      <span>Website</span>
                      {companyWebsiteDisplay ? (
                        <span className="text-[11px] text-blue-500">({companyWebsiteDisplay})</span>
                      ) : null}
                    </a>
                  ) : null}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Balance Due</p>
                  <p className="text-2xl font-semibold text-slate-900">{formatCurrency(balanceDue)}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Bill To</h2>
            <p className="mt-2 text-[13px] text-slate-700">{customer.name}</p>
            {customer.email ? <p className="text-[12px] text-slate-500">{customer.email}</p> : null}
            {customer.phone ? <p className="text-[12px] text-slate-500">{customer.phone}</p> : null}
            {propertyAddress ? (
              <pre className="mt-3 whitespace-pre-wrap text-[12px] text-slate-500">{propertyAddress}</pre>
            ) : null}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">From</h2>
            <p className="mt-2 text-[13px] text-slate-700">{companyDisplayName}</p>
            {companyContactEmail ? <p className="text-[12px] text-slate-500">{companyContactEmail}</p> : null}
            {companyContactPhone ? <p className="text-[12px] text-slate-500">{companyContactPhone}</p> : null}
            {companyAddress ? (
              <pre className="mt-3 whitespace-pre-wrap text-[12px] text-slate-500">{companyAddress}</pre>
            ) : null}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full table-fixed">
            <thead className="bg-slate-50 text-left text-[12px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="w-16 px-4 py-3 text-right">Qty</th>
                <th className="w-24 px-4 py-3 text-right">Unit</th>
                <th className="w-24 px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[12px] text-slate-700">
              {invoice.line_items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-center text-slate-500" colSpan={4}>
                    No line items yet.
                  </td>
                </tr>
              ) : (
                invoice.line_items.map((item) => {
                  const lineTotal = item.quantity * item.unit_price;
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        {item.description ? (
                          <p className="mt-1 text-[12px] text-slate-500">{item.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right align-top">{item.quantity.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right align-top">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right align-top">{formatCurrency(lineTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 text-[12px] text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-slate-600">
              <span>Balance Due</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </section>

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

        {invoice.notes ? (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
            <p className="mt-2 whitespace-pre-wrap text-[12px] text-slate-600">{invoice.notes}</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
