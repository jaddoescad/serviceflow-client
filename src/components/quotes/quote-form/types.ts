import type {
  EditableQuoteLineItem,
  QuoteRecord,
  QuoteDeliveryMethod,
} from "@/features/quotes";
import type { ProductTemplateRecord } from "@/features/products";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import type { ProposalAttachmentAsset } from "@/types/proposal-attachments";
import type { QuoteCompanyBranding } from "@/types/company-branding";
import type { WorkOrderDeliveryMethod } from "@/types/work-order-delivery";

export type ProposalTemplateContext = {
  companyName: string;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  clientName: string;
  quoteNumber: string;
  proposalUrl?: string | null;
  invoiceUrl?: string | null;
  changeOrderNumber?: string | null;
};

export type WorkOrderTemplateContext = {
  companyName: string;
  clientName: string;
  quoteNumber: string;
  workOrderUrl: string;
  workOrderAddress: string;
};

export type WorkOrderDialogContext = {
  method: WorkOrderDeliveryMethod;
  variant: "standard" | "secret";
};

export type QuoteFormProps = {
  companyName: string;
  companyId: string;
  dealId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  initialQuote: QuoteRecord | null;
  defaultQuoteNumber: string;
  proposalTemplate: CommunicationTemplateSnapshot;
  workOrderTemplate: CommunicationTemplateSnapshot;
  changeOrderTemplate: CommunicationTemplateSnapshot;
  productTemplates: ProductTemplateRecord[];
  companyBranding: QuoteCompanyBranding;
  initialAttachments?: ProposalAttachmentAsset[];
  taxRate?: number | null;
  origin?: string;
  initialInvoiceUrl?: string | null;
  isArchived?: boolean;
};
