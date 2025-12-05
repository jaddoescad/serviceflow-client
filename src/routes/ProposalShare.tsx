import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import { formatQuoteId } from "@/lib/form-utils";
import { loadQuoteShareSnapshot } from "@/lib/quote-share-loader.server";
import { ProposalAcceptance } from "@/components/proposals/proposal-acceptance";
import { DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT } from "@/constants/proposal-terms";
import { ChangeOrderApprovals } from "@/components/proposals/change-order-approvals";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { SignatureDisplay } from "@/components/ui/signature-display";
import { useSessionContext } from "@/contexts/AuthContext";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const formatDateTime = (value: string) => DATE_TIME_FORMATTER.format(new Date(value));

export default function ProposalSharePage() {
  const params = useParams();
  const navigate = useNavigate();
  const shareId = params.shareId as string;
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<any>(null);

  // Check if user is authenticated (employee viewing customer view)
  const { isAuthenticated } = useSessionContext();
  const isEmployeeView = isAuthenticated;

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadQuoteShareSnapshot(shareId);

        if (!data) {
          navigate("/");
          return;
        }

        setPageData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading proposal:', error);
        navigate("/");
      }
    }

    loadData();
  }, [shareId, navigate]);

  if (loading) {
    return <LoadingPage message="Loading proposal..." />;
  }

  if (!pageData) {
    return null;
  }

  const { quote, company, customer, propertyAddress, changeOrders = [], invoiceForQuote = null } = pageData;
  const totals = quote.line_items.reduce(
    (acc: { subtotal: number; total: number }, item: any) => {
      const lineTotal = item.quantity * item.unit_price;
      return {
        subtotal: acc.subtotal + lineTotal,
        total: acc.total + lineTotal,
      };
    },
    { subtotal: 0, total: 0 }
  );

  const taxRate = company?.tax_rate ?? 0;
  const taxAmount = totals.subtotal * (taxRate / 100);
  const totalWithTax = totals.subtotal + taxAmount;

  const companyDisplayName = company?.physical_company_name ?? company?.name ?? "";
  const companyContactEmail = company?.email ?? null;
  const companyContactPhone = company?.phone_number ?? null;
  const companyWebsite = company?.website ?? null;
  const companyReviewUrl = company?.review_url ?? null;
  const companyLogoUrl = (company as { logo_url?: string | null } | null)?.logo_url ?? null;
  const companyWebsiteDisplay = companyWebsite
    ? companyWebsite.replace(/^https?:\/\//i, "")
    : null;
  const createdLabel = formatDateTime(quote.created_at);
  const invoiceId = invoiceForQuote?.id ?? null;
  const changeOrdersArray = Array.isArray(changeOrders) ? changeOrders : [];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Proposal Total</p>
            <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalWithTax)}</p>
          </div>
          <div className="self-end sm:self-auto">
            {isEmployeeView ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Employee View</p>
                <p className="text-[12px] text-slate-600">Customer approval options hidden</p>
              </div>
            ) : (
              <div className="max-w-[240px] shrink-0">
                <ProposalAcceptance
                  shareId={shareId}
                  initialStatus={quote.status}
                  variant="inline"
                  termsText={company?.proposal_terms_template_content ?? DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-12 pt-10">
        <ChangeOrderApprovals
          changeOrders={changeOrdersArray}
          invoiceId={invoiceId}
          customerName={customer.name}
          customerEmail={customer.email ?? null}
          readOnly={isEmployeeView}
        />
        <div className="rounded-2xl bg-white px-6 py-8 shadow-xl">
          <header className="border-b border-slate-200 pb-6">
            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Proposal #{formatQuoteId(quote.id)}
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">Proposal Overview</h1>
                <p className="mt-2 text-sm text-slate-600">Prepared for {customer.name}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Created {createdLabel}
                </p>
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
                  <p className="font-semibold text-slate-900">Customer</p>
                  <p>{customer.name}</p>
                  <div className="mt-2 space-y-1">
                    <p>{customer.email ?? "No email provided"}</p>
                    <p>{customer.phone ?? "No phone provided"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Project Address</p>
                  {propertyAddress ? (
                    <p className="whitespace-pre-line">{propertyAddress}</p>
                  ) : (
                    <p>No address provided</p>
                  )}
                </div>
              </div>
            </div>
          </header>

          <section className="mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4">Item</th>
                <th className="pb-2 pr-4 text-right">Qty</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quote.line_items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-slate-500">
                    No line items added yet.
                  </td>
                </tr>
              ) : (
                quote.line_items.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                      {item.description ? (
                        <span className="text-sm text-slate-600 whitespace-pre-line">
                          {item.description}
                        </span>
                      ) : null}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-right text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-sm text-right font-medium text-slate-900">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-right text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(totalWithTax)}</span>
              </div>
            </div>
          </div>
        </section>

        {(quote.client_message?.trim() || quote.disclaimer?.trim()) && (
          <section className="mt-6 space-y-4">
            {quote.client_message?.trim() ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Message</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{quote.client_message}</p>
              </div>
            ) : null}
            {quote.disclaimer?.trim() ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Terms & Disclaimer</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{quote.disclaimer}</p>
              </div>
            ) : null}
          </section>
        )}

        {quote.acceptance_signature ? (
          <section className="mt-6">
            <SignatureDisplay
              signature={quote.acceptance_signature}
              signatureType={quote.signature_type}
              signedAt={quote.acceptance_signed_at}
              dateFormatter={formatDateTime}
            />
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
            <p>Sent via ServiceFlow • Proposal #{formatQuoteId(quote.id)}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
