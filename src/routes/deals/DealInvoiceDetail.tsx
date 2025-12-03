import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useInvoiceDetail } from "@/hooks";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import { InvoiceDetailPageSkeleton } from "@/components/ui/skeleton";
import { toCommunicationTemplateSnapshot } from "@/features/communications";
import type { DealRecord } from "@/features/deals";

const buildContactDisplay = (deal: DealRecord) => {
  const first = deal?.first_name ?? deal?.contact?.first_name ?? "";
  const last = deal?.last_name ?? deal?.contact?.last_name ?? "";
  return `${first} ${last}`.trim() || "Client";
};

export default function InvoicePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();

  const dealId = params.dealId as string;
  const invoiceId = params.invoiceId as string;

  const { data, isLoading: detailLoading } = useInvoiceDetail(dealId, invoiceId, company?.id);

  const pageData = useMemo(() => {
    if (!data || !company) return null;

    const { deal, invoice, paymentRequests, payments, templates } = data;

    const clientName = buildContactDisplay(deal);
    const clientEmail = deal.email || deal.contact?.email || "";
    const clientPhone = deal.phone || deal.contact?.phone || "";

    return {
      company,
      deal,
      invoice,
      clientName,
      clientEmail,
      clientPhone,
      template: toCommunicationTemplateSnapshot("invoice_send", templates.invoiceSend),
      paymentRequestTemplate: toCommunicationTemplateSnapshot("invoice_payment_request", templates.paymentRequest),
      paymentReceiptTemplate: toCommunicationTemplateSnapshot("payment_receipt", templates.paymentReceipt),
      paymentRequests,
      payments,
    };
  }, [data, company]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  useEffect(() => {
    // Only redirect if auth is loaded, company is set, and we've finished loading but no data
    if (!authLoading && company && !detailLoading && !data) {
      navigate("/");
    }
  }, [authLoading, company, detailLoading, data, navigate]);

  if (authLoading || detailLoading || !pageData) {
    return <InvoiceDetailPageSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <InvoiceDetail
          companyId={pageData.company.id}
          companyName={pageData.company.name ?? ""}
          companyEmail={pageData.company.email ?? null}
          dealId={pageData.deal.id}
          invoice={pageData.invoice}
          paymentRequests={pageData.paymentRequests}
          payments={pageData.payments}
          clientName={pageData.clientName}
          clientEmail={pageData.clientEmail}
          clientPhone={pageData.clientPhone}
          invoiceTemplate={pageData.template}
          paymentRequestTemplate={pageData.paymentRequestTemplate}
          paymentReceiptTemplate={pageData.paymentReceiptTemplate}
          isArchived={Boolean(pageData.deal.archived_at)}
        />
      </div>
    </div>
  );
}
