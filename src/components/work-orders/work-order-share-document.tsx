import type { QuoteShareSnapshot } from "@/types/quote-shares";

export type WorkOrderShareVariant = "standard" | "secret";

type WorkOrderShareDocumentProps = {
  snapshot: QuoteShareSnapshot;
  variant: WorkOrderShareVariant;
};

export function WorkOrderShareDocument({ snapshot, variant }: WorkOrderShareDocumentProps) {
  const { quote, company, customer, propertyAddress } = snapshot;
  const showCustomerDetails = variant === "standard";
  const showJobSiteAddress = showCustomerDetails;
  const companyDisplayName = company?.physical_company_name ?? company?.name ?? "";
  const companyLogoUrl = company?.logo_url ?? null;
  const companyWebsiteDisplay = company?.website ? company.website.replace(/^https?:\/\//i, "") : null;
  const workOrderTitle = quote.title.trim() !== "" ? quote.title : "Work Order";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-3xl px-6 pb-12 pt-10">
        <div className="rounded-2xl bg-white px-6 py-8 shadow-xl">
          <header className="border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Work Order #{quote.quote_number}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-slate-900">{workOrderTitle}</h1>
                  {showCustomerDetails ? (
                    <p className="mt-2 text-sm text-slate-600">Prepared for {customer.name}</p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">Client information hidden on this link.</p>
                  )}
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <div className="flex items-center justify-center">
                    {companyLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
                    {company?.phone_number ? <p>{company.phone_number}</p> : null}
                    {company?.email ? <p>{company.email}</p> : null}
                    {company?.website ? (
                      <a
                        href={company.website}
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
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {showCustomerDetails ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Customer</p>
                    <p>{customer.name}</p>
                    <div className="mt-2 space-y-1">
                      <p>{customer.email ?? "No email provided"}</p>
                      <p>{customer.phone ?? "No phone provided"}</p>
                    </div>
                  </div>
                ) : null}
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Job Site</p>
                  {showJobSiteAddress && propertyAddress ? (
                    <p className="whitespace-pre-line">{propertyAddress}</p>
                  ) : showJobSiteAddress ? (
                    <p>No address provided</p>
                  ) : (
                    <p className="text-slate-600">Job site address hidden on this link.</p>
                  )}
                  {!showCustomerDetails ? (
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                      Client contact details withheld
                    </p>
                  ) : null}
                </div>
              </div>

              {variant === "secret" ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <p className="font-semibold text-amber-900">Confidential Link</p>
                  <p className="mt-1">
                    Do not forward customer details. This view intentionally hides contact information and job site
                    address while retaining the scope of work.
                  </p>
                </div>
              ) : null}
            </div>
          </header>

          <section className="mt-6">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Item</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {quote.line_items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-slate-500">
                      No tasks added yet.
                    </td>
                  </tr>
                ) : (
                  quote.line_items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 text-sm font-semibold text-slate-800">{item.name}</td>
                      <td className="py-3 pr-4 text-sm text-slate-600">{item.description ?? "—"}</td>
                      <td className="py-3 text-sm text-right font-medium text-slate-900">{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {(quote.client_message?.trim() || quote.disclaimer?.trim()) && (
            <section className="mt-6 space-y-4">
              {quote.client_message?.trim() ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">Crew Notes</h2>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{quote.client_message}</p>
                </div>
              ) : null}
              {quote.disclaimer?.trim() ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">Safety & Terms</h2>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{quote.disclaimer}</p>
                </div>
              ) : null}
            </section>
          )}

          <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            <p>
              Generated via ServiceFlow • Proposal ID {quote.public_share_id}
              {variant === "secret" ? " • Secret Work Order" : ""}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
