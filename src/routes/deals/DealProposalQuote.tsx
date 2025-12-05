import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { QuoteForm } from "@/components/quotes/quote-form";
import { useDealProposalData } from "@/hooks";
import { formatFullName } from "@/lib/name";
import { QuoteFormSkeleton } from "@/components/ui/skeleton";
import type { QuoteCompanyBranding } from "@/types/company-branding";
import type {
  CommunicationTemplateKey,
  CommunicationTemplateRecord,
  CommunicationTemplateSnapshot,
} from "@/types/communication-templates";
import { toCommunicationTemplateSnapshot } from "@/lib/communication-templates";

function mapTemplate(
  record: CommunicationTemplateRecord | null,
  fallbackKey: CommunicationTemplateKey
): CommunicationTemplateSnapshot {
  const key = record?.template_key ?? fallbackKey;
  return toCommunicationTemplateSnapshot(key, record);
}

export default function QuoteBuilderPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();

  const dealId = params.dealId as string;
  const quoteId = searchParams.get("quoteId") ?? null;

  const { data: payload, isLoading: proposalLoading } = useDealProposalData(dealId, quoteId);

  const pageData = useMemo(() => {
    if (!payload || !company) return null;

    const {
      deal,
      quote,
      attachments = [],
      quoteCount,
      proposalTemplate,
      workOrderTemplate,
      changeOrderTemplate,
      productTemplates = [],
      quoteCompanyBranding,
      companySettings,
      invoiceForQuote,
    } = payload;

    if (!deal) return null;

    const mappedBranding: QuoteCompanyBranding | null = quoteCompanyBranding ? {
      name: quoteCompanyBranding.name || '',
      email: quoteCompanyBranding.email,
      phone: quoteCompanyBranding.phone_number || quoteCompanyBranding.phone,
      website: quoteCompanyBranding.website,
      reviewUrl: quoteCompanyBranding.review_url,
      logoUrl: quoteCompanyBranding.logo_url
    } : null;

    const clientName = formatFullName({ first_name: deal.first_name, last_name: deal.last_name }) || "Client";
    const clientEmail = deal.email || deal.contact?.email || "";
    const clientPhone = deal.phone || deal.contact?.phone || "";

    const addressParts = [];
    if (deal.service_address?.address_line1) addressParts.push(deal.service_address.address_line1);
    if (deal.service_address?.city) addressParts.push(deal.service_address.city);
    if (deal.service_address?.state) addressParts.push(deal.service_address.state);
    if (deal.service_address?.postal_code) addressParts.push(deal.service_address.postal_code);
    const propertyAddress = addressParts.join(", ") || "No address set";

    // For existing quotes, use their quote_number; for new quotes, it will be generated on save
    const defaultQuoteNumber = quote?.quote_number ?? "New Quote";

    const taxRate = companySettings?.tax_rate ?? null;
    const initialInvoiceUrl =
      quote && invoiceForQuote ? `/deals/${deal.id}/invoices/${invoiceForQuote.id}` : null;

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    return {
      company,
      deal,
      quote,
      quoteCount,
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
      defaultQuoteNumber,
      proposalTemplate,
      workOrderTemplate,
      changeOrderTemplate,
      productTemplates,
      mappedBranding,
      attachments,
      taxRate,
      origin,
      initialInvoiceUrl,
    };
  }, [payload, company]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  useEffect(() => {
    if (!proposalLoading && payload && !payload.deal) {
      navigate("/");
    }
  }, [proposalLoading, payload, navigate]);

  if (authLoading || proposalLoading) {
    return <QuoteFormSkeleton />;
  }

  if (!pageData) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <QuoteForm
          companyName={pageData.company.name ?? ""}
          companyId={pageData.company.id}
          dealId={pageData.deal.id}
          clientName={pageData.clientName}
          clientEmail={pageData.clientEmail}
          clientPhone={pageData.clientPhone}
          propertyAddress={pageData.propertyAddress}
          initialQuote={pageData.quote}
          defaultQuoteNumber={pageData.defaultQuoteNumber}
          proposalTemplate={mapTemplate(pageData.proposalTemplate, "proposal_quote")}
          workOrderTemplate={mapTemplate(pageData.workOrderTemplate, "work_order_dispatch")}
          changeOrderTemplate={mapTemplate(pageData.changeOrderTemplate, "change_order_send")}
          productTemplates={pageData.productTemplates}
          companyBranding={pageData.mappedBranding || { name: pageData.company.name || '', email: null, phone: null, website: null, reviewUrl: null, logoUrl: null }}
          initialAttachments={pageData.attachments}
          taxRate={pageData.taxRate}
          origin={pageData.origin}
          initialInvoiceUrl={pageData.initialInvoiceUrl}
          isArchived={Boolean(pageData.deal.archived_at)}
        />
      </div>
    </div>
  );
}
