import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DealDetailBoard } from "@/features/deals";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useDealDetail } from "@/hooks";
import { DealDetailPageSkeleton } from "@/components/ui/skeleton";
import { formatByteSize } from "@/lib/attachments";
import { formatQuoteId } from "@/lib/form-utils";
import type {
  DealAttachmentRecord,
  DealDetailSnapshot,
  DealInvoiceRecord,
  DealProposalRecord,
} from "@/types/deal-details";
import type { DealNoteWithAuthor } from "@/types/deal-notes";
import type { QuoteRecord } from "@/types/quotes";
import type { InvoiceRecord } from "@/types/invoices";

export default function DealPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const dealId = params.dealId as string;

  const { data: payload, isLoading: detailLoading } = useDealDetail(dealId);

  const companyDisplayName =
    company?.short_name?.trim() || company?.name?.trim() || "Your Company";

  const pageData = useMemo(() => {
    if (!payload) return null;

    const {
      deal,
      quotes,
      invoices,
      dealNotes,
      attachments,
      proposalAttachments,
      appointments,
    } = payload;

    if (!deal) return null;

    // Notes now include author names from the RPC
    const notes: DealNoteWithAuthor[] = (dealNotes ?? []).map((note: any) => ({
      id: note.id,
      body: note.body,
      created_at: note.created_at,
      author_user_id: note.author_user_id,
      author: note.author ?? "Team Member",
    }));

    const mergedAttachments: DealAttachmentRecord[] = [
      ...(attachments ?? []),
      ...mapProposalAttachmentsToDealAttachments(proposalAttachments ?? []),
    ];

    // Build the snapshot - appointments now include assignee_name from RPC
    const appointmentList =
      appointments && Array.isArray(appointments) && appointments.length > 0
        ? appointments
        : deal.latest_appointment
          ? [deal.latest_appointment]
          : [];

    const snapshot: DealDetailSnapshot = {
      deal,
      proposals: (quotes ?? []).map((quote: QuoteRecord) => mapQuoteToDealProposal(quote, invoices ?? [])),
      invoices: (invoices ?? []).map(mapInvoiceToDealInvoice),
      appointments: appointmentList,
      notes,
      attachments: mergedAttachments,
      checklist: [],
    };

    return { snapshot };
  }, [payload]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  useEffect(() => {
    if (!detailLoading && payload && !payload.deal) {
      navigate("/");
    }
  }, [detailLoading, payload, navigate]);

  if (authLoading || detailLoading) {
    return <DealDetailPageSkeleton />;
  }

  if (!pageData || !company || !user) {
    return null;
  }

  return (
    <DealDetailBoard
      snapshot={pageData.snapshot}
      companyId={company.id}
      companyName={companyDisplayName}
      currentUserId={user.id}
    />
  );
}

function mapQuoteToDealProposal(quote: QuoteRecord, _invoices: InvoiceRecord[]): DealProposalRecord {
  const baseItems = (quote.line_items ?? []).filter((item: any) => !item.is_change_order && !item.change_order_id);
  const total = baseItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const statusMap: Record<QuoteRecord["status"], DealProposalRecord["status"]> = {
    draft: "draft",
    sent: "sent",
    accepted: "signed",
    declined: "declined",
  };

  const status = statusMap[quote.status];

  const sentAt = quote.status === "draft" ? null : quote.updated_at;
  const signedAt = quote.status === "accepted" ? quote.updated_at : null;

  const displayId = formatQuoteId(quote.id);
  const name = quote.title.trim() !== "" ? quote.title : displayId;

  return {
    id: quote.id,
    name,
    version: displayId,
    total,
    status,
    public_share_id: quote.public_share_id,
    ...(sentAt ? { sent_at: sentAt } : {}),
    ...(signedAt ? { signed_at: signedAt } : {}),
  } satisfies DealProposalRecord;
}

function mapInvoiceToDealInvoice(invoice: InvoiceRecord): DealInvoiceRecord {
  const statusMap: Record<InvoiceRecord["status"], DealInvoiceRecord["status"]> = {
    unpaid: "unpaid",
    partial: "partial",
    paid: "paid",
    overdue: "overdue",
  };

  return {
    id: invoice.id,
    number: invoice.invoice_number,
    title: invoice.title.trim() || invoice.invoice_number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    total: invoice.total_amount,
    balance: invoice.balance_due,
    status: statusMap[invoice.status],
    public_share_id: invoice.public_share_id,
  } satisfies DealInvoiceRecord;
}

function mapProposalAttachmentsToDealAttachments(
  proposalAttachments: Array<{
    id: string;
    original_filename: string;
    signed_url?: string;
    content_type?: string;
    byte_size?: number;
    uploaded_at: string;
    uploader_name?: string;
    thumbnail_url?: string;
  }>
): DealAttachmentRecord[] {
  return proposalAttachments
    .filter((attachment) => Boolean(attachment.signed_url))
    .map((attachment) => {
      const isImage = attachment.content_type?.startsWith("image/");

      return {
        id: attachment.id,
        filename: attachment.original_filename,
        url: attachment.signed_url!,
        uploaded_at: attachment.uploaded_at,
        uploaded_by: attachment.uploader_name ?? "Team Member",
        file_size: formatByteSize(attachment.byte_size ?? 0),
        type: isImage ? "image" : "proposal",
        ...(isImage
          ? { thumbnail_url: attachment.thumbnail_url ?? attachment.signed_url }
          : {}),
      } satisfies DealAttachmentRecord;
    });
}
