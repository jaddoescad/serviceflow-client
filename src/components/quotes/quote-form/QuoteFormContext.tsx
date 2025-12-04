"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type {
  EditableQuoteLineItem,
  QuoteRecord,
  QuoteDeliveryMethod,
  QuoteDeliveryRequestPayload,
  UpsertQuoteInput,
  UpsertQuoteLineItemInput,
  SaveQuotePayload,
} from "@/features/quotes";
import type { ProductTemplateRecord } from "@/features/products";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import type { ProposalAttachmentAsset } from "@/types/proposal-attachments";
import type { WorkOrderDeliveryMethod, WorkOrderDeliveryRequestPayload } from "@/types/work-order-delivery";
import { QUOTE_DEFAULT_CLIENT_MESSAGE, QUOTE_DEFAULT_DISCLAIMER, createQuote, deleteQuote, sendQuoteDelivery, acceptQuoteWithoutSignature } from "@/features/quotes";
import { getInvoiceByQuoteId } from "@/features/invoices";
import { parseUnitPrice, createClientId, formatQuoteId } from "@/lib/form-utils";
import { renderCommunicationTemplate } from "@/features/communications";
import { getBrowserProposalShareUrl, getEmployeeProposalPreviewUrl } from "@/lib/proposal-share";
import {
  getBrowserSecretWorkOrderShareUrl,
  getBrowserWorkOrderShareUrl,
} from "@/lib/work-order-share";
import { createProposalAttachmentsRepository } from "@/services/proposal-attachments";
import { createWorkOrderDeliveryRepository } from "@/services/work-order-delivery";
import { createImageThumbnail, isImageContentType } from "@/lib/attachments";

import type { QuoteFormProps, WorkOrderDialogContext } from "./types";
import { mapRecordToEditable, createEmptyLineItem, buildProposalTemplateDefaults, buildWorkOrderTemplateDefaults, formatDateTime, getStatusLabel } from "./utils";
import { STATUS_STYLES } from "./constants";

// ============================================================================
// Context Types
// ============================================================================

type QuoteFormState = {
  quoteId: string | undefined;
  publicShareId: string | null;
  status: QuoteRecord["status"];
  quoteNumber: string;
  createdAt: Date | null;
  clientMessage: string;
  disclaimer: string;
  lineItems: EditableQuoteLineItem[];
  editingLineItems: Set<string>;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: Date | null;
  hasPendingChanges: boolean;
  isDeleting: boolean;
  isProposalLocked: boolean;
  productTemplateOptions: ProductTemplateRecord[];
};

type AttachmentsState = {
  attachments: ProposalAttachmentAsset[];
  pendingUploads: Array<{ id: string; previewUrl: string; fileName: string }>;
  imageAttachments: ProposalAttachmentAsset[];
  error: string | null;
  isUploading: boolean;
  deletingId: string | null;
  activeIndex: number | null;
};

type SendDialogState = {
  isOpen: boolean;
  context: "proposal" | "change_order";
  method: QuoteDeliveryMethod;
  emailRecipient: string;
  emailCc: string;
  emailSubject: string;
  emailBody: string;
  textRecipient: string;
  textBody: string;
  activeChangeOrderNumber: string | null;
  isSending: boolean;
  error: string | null;
  successMessage: string | null;
};

type WorkOrderState = {
  dialogState: WorkOrderDialogContext | null;
  isSending: boolean;
  error: string | null;
  successMessage: string | null;
  shareUrl: string | null;
  secretShareUrl: string | null;
  currentDefaults: { smsBody: string; emailSubject: string; emailBody: string } | null;
  currentUrl: string | null;
};

type ComputedValues = {
  totals: { subtotal: number; tax: number; taxRate: number; total: number };
  statusLabel: string;
  statusClass: string;
  customerViewUrl: string | null;
  shareDisabledReason: string | null;
  displayQuoteNumber: string;
  lastSavedLabel: string;
  invoiceUrl: string | null;
};

type QuoteFormContextValue = {
  // Props passed from parent
  companyId: string;
  companyName: string;
  dealId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  companyBranding: QuoteFormProps["companyBranding"];
  taxRate: number | null;
  isArchived: boolean;

  // State
  state: QuoteFormState;
  attachments: AttachmentsState;
  sendDialog: SendDialogState;
  workOrder: WorkOrderState;
  computed: ComputedValues;

  // UI State
  isNavigatingBack: boolean;

  // Actions - Quote Form
  setQuoteNumber: (value: string) => void;
  setClientMessage: (value: string) => void;
  setDisclaimer: (value: string) => void;
  toggleLineItemEdit: (clientId: string) => void;
  handleAddLineItem: () => void;
  handleAddDiscount: () => void;
  handleLineItemFieldChange: (clientId: string, field: "name" | "description", value: string) => void;
  handleLineItemUnitPriceChange: (clientId: string, value: string) => void;
  handleApplyTemplate: (clientId: string, templateId: string) => void;
  handleDeleteLineItem: (clientId: string) => void;
  handleSaveQuote: () => Promise<QuoteRecord | null>;
  handleDeleteQuote: () => Promise<void>;

  // Actions - Attachments
  handleAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleAttachmentDelete: (attachment: ProposalAttachmentAsset) => Promise<void>;
  handleOpenAttachment: (index: number) => void;
  handleCloseAttachment: () => void;
  handleStepAttachment: (direction: -1 | 1) => void;

  // Actions - Send Dialog
  openSendDialog: (options?: { variant?: "proposal" | "change_order"; changeOrderNumber?: string | null }) => void;
  closeSendDialog: () => void;
  setSendMethod: (method: QuoteDeliveryMethod) => void;
  setSendEmailRecipient: (value: string) => void;
  setSendEmailCc: (value: string) => void;
  setSendEmailSubject: (value: string) => void;
  setSendEmailBody: (value: string) => void;
  setSendTextRecipient: (value: string) => void;
  setSendTextBody: (value: string) => void;
  handleSendProposal: () => Promise<void>;

  // Actions - Work Order
  handleWorkOrderSendRequest: (options: { method: WorkOrderDeliveryMethod; variant: "standard" | "secret" }) => void;
  handleWorkOrderDeliverySubmit: (payload: WorkOrderDeliveryRequestPayload) => Promise<void>;
  closeWorkOrderDialog: () => void;

  // Actions - Navigation/UI
  handleBackToDeal: () => void;

  // Actions - Accept without signature
  handleAcceptWithoutSignature: () => Promise<void>;
  isAcceptingWithoutSignature: boolean;
  acceptWithoutSignatureError: string | null;
};

// ============================================================================
// Context Creation
// ============================================================================

const QuoteFormContext = createContext<QuoteFormContextValue | null>(null);

// ============================================================================
// Hook to use context
// ============================================================================

export function useQuoteFormContext() {
  const context = useContext(QuoteFormContext);
  if (!context) {
    throw new Error("useQuoteFormContext must be used within a QuoteFormProvider");
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

type QuoteFormProviderProps = QuoteFormProps & {
  children: ReactNode;
};

export function QuoteFormProvider({
  children,
  companyName,
  companyId,
  dealId,
  clientName,
  clientEmail,
  clientPhone,
  propertyAddress,
  initialQuote,
  defaultQuoteNumber,
  proposalTemplate,
  workOrderTemplate,
  changeOrderTemplate,
  productTemplates,
  companyBranding,
  initialAttachments = [],
  taxRate = null,
  origin,
  initialInvoiceUrl = null,
  isArchived = false,
}: QuoteFormProviderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Repositories
  const attachmentsRepository = useMemo(() => createProposalAttachmentsRepository(), []);
  const workOrderDeliveryRepository = useMemo(() => createWorkOrderDeliveryRepository(), []);

  // ============================================================================
  // Core Quote State
  // ============================================================================
  const initialLineItems = useMemo(() => {
    if (initialQuote && initialQuote.line_items.length > 0) {
      return initialQuote.line_items.map((item) => mapRecordToEditable(item));
    }
    return [createEmptyLineItem()];
  }, [initialQuote]);

  const [quoteId, setQuoteId] = useState<string | undefined>(() => initialQuote?.id);
  const [publicShareId, setPublicShareId] = useState<string | null>(() => initialQuote?.public_share_id ?? null);
  const [status, setStatus] = useState<QuoteRecord["status"]>(() => initialQuote?.status ?? "draft");
  const [quoteNumber, setQuoteNumber] = useState(() => initialQuote?.quote_number ?? defaultQuoteNumber);
  const [createdAt, setCreatedAt] = useState<Date | null>(() =>
    initialQuote ? new Date(initialQuote.created_at) : null
  );
  const [clientMessage, setClientMessage] = useState(
    () => initialQuote?.client_message ?? QUOTE_DEFAULT_CLIENT_MESSAGE
  );
  const [disclaimer, setDisclaimer] = useState(
    () => initialQuote?.disclaimer ?? QUOTE_DEFAULT_DISCLAIMER
  );
  const [lineItems, setLineItems] = useState<EditableQuoteLineItem[]>(() => initialLineItems);
  const [deletedLineItemIds, setDeletedLineItemIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() =>
    initialQuote ? new Date(initialQuote.updated_at) : null
  );
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const [editingLineItems, setEditingLineItems] = useState<Set<string>>(new Set());

  const isProposalLocked = status === "accepted" || isArchived;

  const productTemplateOptions = useMemo(() => {
    return productTemplates
      .slice()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }, [productTemplates]);

  const productTemplateMap = useMemo(() => {
    const map = new Map<string, ProductTemplateRecord>();
    productTemplateOptions.forEach((template) => {
      map.set(template.id, template);
    });
    return map;
  }, [productTemplateOptions]);

  // ============================================================================
  // Attachment State
  // ============================================================================
  const [attachments, setAttachments] = useState<ProposalAttachmentAsset[]>(() => initialAttachments);
  const [pendingUploads, setPendingUploads] = useState<
    Array<{ id: string; previewUrl: string; fileName: string }>
  >([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<number | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);

  const imageAttachments = useMemo(
    () => attachments.filter((attachment) => isImageContentType(attachment.content_type)),
    [attachments]
  );

  // ============================================================================
  // Send Dialog State
  // ============================================================================
  const initialTemplateDefaults = useMemo(() => buildProposalTemplateDefaults(proposalTemplate), [proposalTemplate]);

  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendContext, setSendContext] = useState<"proposal" | "change_order">("proposal");
  const [sendMethod, setSendMethod] = useState<QuoteDeliveryMethod>("both");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState(() => initialTemplateDefaults.emailSubject);
  const [emailBody, setEmailBody] = useState(() => initialTemplateDefaults.emailBody);
  const [textRecipient, setTextRecipient] = useState(() => clientPhone?.trim() || "");
  const [textBody, setTextBody] = useState(() => initialTemplateDefaults.smsBody);
  const [activeChangeOrderNumber, setActiveChangeOrderNumber] = useState<string | null>(null);
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // ============================================================================
  // Work Order State
  // ============================================================================
  const [workOrderDialogState, setWorkOrderDialogState] = useState<WorkOrderDialogContext | null>(null);
  const [isSendingWorkOrder, setIsSendingWorkOrder] = useState(false);
  const [workOrderSendError, setWorkOrderSendError] = useState<string | null>(null);
  const [workOrderSendSuccess, setWorkOrderSendSuccess] = useState<string | null>(null);

  // ============================================================================
  // UI State
  // ============================================================================
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(() => initialInvoiceUrl);
  const [isAcceptingWithoutSignature, setIsAcceptingWithoutSignature] = useState(false);
  const [acceptWithoutSignatureError, setAcceptWithoutSignatureError] = useState<string | null>(null);

  // ============================================================================
  // Computed Values
  // ============================================================================
  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + parseUnitPrice(item.unitPrice), 0);
    const tax = subtotal * ((taxRate ?? 0) / 100);
    const total = subtotal + tax;
    return { subtotal, tax, taxRate: taxRate ?? 0, total };
  }, [lineItems, taxRate]);

  const statusLabel = getStatusLabel(status);
  const customerViewUrl = useMemo(
    () => getEmployeeProposalPreviewUrl(publicShareId, origin),
    [publicShareId, origin]
  );
  const shareDisabledReason = publicShareId ? null : "Save the quote to access share links.";
  // Use quote ID for display (formatted as Q-XXXXXXXX)
  const displayQuoteNumber = quoteId ? formatQuoteId(quoteId) : "New Quote";
  const lastSavedLabel = lastSavedAt ? formatDateTime(lastSavedAt) : "Not yet saved";

  const workOrderShareUrl = useMemo(
    () => getBrowserWorkOrderShareUrl(publicShareId, origin),
    [publicShareId, origin]
  );

  const secretWorkOrderShareUrl = useMemo(
    () => getBrowserSecretWorkOrderShareUrl(publicShareId, origin),
    [publicShareId, origin]
  );

  const workOrderStandardDefaults = useMemo(() => {
    return buildWorkOrderTemplateDefaults(workOrderTemplate, {
      companyName,
      clientName,
      quoteNumber: displayQuoteNumber,
      workOrderUrl: workOrderShareUrl ?? "",
      workOrderAddress: propertyAddress,
    });
  }, [workOrderTemplate, companyName, clientName, displayQuoteNumber, workOrderShareUrl, propertyAddress]);

  const workOrderSecretDefaults = useMemo(() => {
    return buildWorkOrderTemplateDefaults(workOrderTemplate, {
      companyName,
      clientName,
      quoteNumber: displayQuoteNumber,
      workOrderUrl: secretWorkOrderShareUrl ?? "",
      workOrderAddress: propertyAddress,
    });
  }, [workOrderTemplate, companyName, clientName, displayQuoteNumber, secretWorkOrderShareUrl, propertyAddress]);

  const currentWorkOrderDefaults = workOrderDialogState?.variant === "secret"
    ? workOrderSecretDefaults
    : workOrderStandardDefaults;

  const currentWorkOrderUrl = workOrderDialogState?.variant === "secret"
    ? secretWorkOrderShareUrl
    : workOrderShareUrl;

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (isProposalLocked) {
      setEditingLineItems(new Set());
    }
  }, [isProposalLocked]);

  useEffect(() => {
    if (initialQuote?.public_share_id) {
      setPublicShareId(initialQuote.public_share_id);
    }
  }, [initialQuote?.public_share_id]);

  // Fetch invoice URL
  useEffect(() => {
    let cancelled = false;
    const loadInvoice = async () => {
      if (!quoteId) {
        if (!cancelled) setInvoiceUrl(null);
        return;
      }

      try {
        const invoice = await getInvoiceByQuoteId(quoteId);
        if (!cancelled) {
          setInvoiceUrl(invoice ? `/deals/${dealId}/invoices/${invoice.id}` : null);
        }
      } catch {
        if (!cancelled) {
          setInvoiceUrl(null);
        }
      }
    };

    void loadInvoice();
    return () => { cancelled = true; };
  }, [dealId, quoteId, status]);

  // Detect pending changes
  useEffect(() => {
    const snapshot = JSON.stringify({
      quoteNumber,
      clientMessage,
      disclaimer,
      status,
      lineItems,
      deletedLineItemIds,
    });

    if (lastSavedSnapshotRef.current === null) {
      lastSavedSnapshotRef.current = snapshot;
      setHasPendingChanges(false);
      return;
    }

    if (isSaving || isDeleting) return;

    setHasPendingChanges(snapshot !== lastSavedSnapshotRef.current);
  }, [quoteNumber, clientMessage, disclaimer, status, lineItems, deletedLineItemIds, isSaving, isDeleting]);

  // Attachment effects
  useEffect(() => {
    if (activeAttachmentIndex === null) return;
    if (imageAttachments.length === 0) {
      setActiveAttachmentIndex(null);
      return;
    }
    if (activeAttachmentIndex > imageAttachments.length - 1) {
      setActiveAttachmentIndex(imageAttachments.length - 1);
    }
  }, [activeAttachmentIndex, imageAttachments]);

  useEffect(() => {
    if (!quoteId) {
      setAttachments([]);
      return;
    }
    if (initialAttachments.length > 0 && attachments.length === 0) {
      setAttachments(initialAttachments);
    }
  }, [quoteId, initialAttachments, attachments.length]);

  useEffect(() => {
    return () => {
      pendingUploads.forEach((pending) => URL.revokeObjectURL(pending.previewUrl));
    };
  }, [pendingUploads]);

  // Keyboard navigation for attachments
  useEffect(() => {
    if (activeAttachmentIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveAttachmentIndex(null);
      } else if (event.key === "ArrowRight") {
        handleStepAttachment(1);
      } else if (event.key === "ArrowLeft") {
        handleStepAttachment(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAttachmentIndex]);

  // ============================================================================
  // Quote Form Handlers
  // ============================================================================
  const toggleLineItemEdit = useCallback((clientId: string) => {
    if (isProposalLocked) return;
    setEditingLineItems((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }, [isProposalLocked]);

  const handleAddLineItem = useCallback(() => {
    if (isProposalLocked) return;
    setLineItems((items) => [...items, createEmptyLineItem()]);
  }, [isProposalLocked]);

  const handleAddDiscount = useCallback(() => {
    if (isProposalLocked) return;
    const discountItem = createEmptyLineItem(true);
    setLineItems((items) => [...items, discountItem]);
    setEditingLineItems((prev) => new Set([...prev, discountItem.client_id]));
  }, [isProposalLocked]);

  const handleLineItemFieldChange = useCallback(
    (clientId: string, field: "name" | "description", value: string) => {
      if (isProposalLocked) return;
      setLineItems((items) =>
        items.map((item) =>
          item.client_id === clientId ? { ...item, [field]: value } : item
        )
      );
    },
    [isProposalLocked]
  );

  const handleLineItemUnitPriceChange = useCallback(
    (clientId: string, value: string) => {
      if (isProposalLocked) return;
      setLineItems((items) =>
        items.map((item) =>
          item.client_id === clientId ? { ...item, unitPrice: value } : item
        )
      );
    },
    [isProposalLocked]
  );

  const handleApplyTemplate = useCallback(
    (clientId: string, templateId: string) => {
      if (isProposalLocked || !templateId) return;
      const template = productTemplateMap.get(templateId);
      if (!template) return;
      setLineItems((items) =>
        items.map((item) => {
          if (item.client_id !== clientId) return item;
          return {
            ...item,
            name: template.name,
            description: template.description ?? "",
            quantity: 1,
          };
        })
      );
    },
    [isProposalLocked, productTemplateMap]
  );

  const handleDeleteLineItem = useCallback(
    (clientId: string) => {
      if (isProposalLocked) return;
      setLineItems((items) => {
        const target = items.find((item) => item.client_id === clientId);
        if (target?.id) {
          setDeletedLineItemIds((ids) =>
            ids.includes(target.id as string) ? ids : [...ids, target.id as string]
          );
        }
        return items.filter((item) => item.client_id !== clientId);
      });
    },
    [isProposalLocked]
  );

  const handleSaveQuote = useCallback(
    async (snapshotOverride?: string): Promise<QuoteRecord | null> => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const normalizedQuoteNumber = quoteNumber.trim() || defaultQuoteNumber;

        const quoteInput: UpsertQuoteInput = {
          id: quoteId,
          company_id: companyId,
          deal_id: dealId,
          quote_number: normalizedQuoteNumber,
          title: normalizedQuoteNumber,
          client_message: clientMessage.trim() === "" ? null : clientMessage,
          disclaimer: disclaimer.trim() === "" ? null : disclaimer,
          status: status || "draft",
        };

        const lineItemsInput: UpsertQuoteLineItemInput[] = lineItems.map((item, index) => ({
          id: item.id,
          name: item.name.trim(),
          description: item.description,
          quantity: 1,
          unitPrice: parseUnitPrice(item.unitPrice),
          position: index,
        }));

        const payload: SaveQuotePayload = {
          quote: quoteInput,
          lineItems: lineItemsInput.map((item) => ({
            ...item,
            unit_price: item.unitPrice,
          })),
          deletedLineItemIds,
        };

        const saved = await createQuote(payload);

        const previousItems = lineItems;
        const updatedLineItems = saved.line_items.map((item, index) => {
          const matchById = previousItems.find((previous) => previous.id && previous.id === item.id);
          const fallbackClientId =
            matchById?.client_id ?? previousItems[index]?.client_id ?? item.id ?? createClientId();
          return mapRecordToEditable(item, fallbackClientId);
        });

        setQuoteId(saved.id);
        setPublicShareId(saved.public_share_id ?? null);
        setStatus(saved.status);
        setQuoteNumber(saved.quote_number);
        setCreatedAt(new Date(saved.created_at));
        setClientMessage(saved.client_message ?? "");
        setDisclaimer(saved.disclaimer ?? "");
        setLineItems(updatedLineItems);
        setDeletedLineItemIds([]);
        setLastSavedAt(new Date(saved.updated_at));

        const committedSnapshot =
          snapshotOverride ??
          JSON.stringify({
            quoteNumber: saved.quote_number,
            clientMessage: saved.client_message ?? "",
            disclaimer: saved.disclaimer ?? "",
            status: saved.status,
            lineItems: updatedLineItems,
            deletedLineItemIds: [] as string[],
          });

        lastSavedSnapshotRef.current = committedSnapshot;
        setHasPendingChanges(false);

        // Invalidate proposal data cache so quote count is updated
        queryClient.invalidateQueries({
          queryKey: ['dealDetail', 'proposalData', dealId],
          exact: false
        });

        return saved;
      } catch (error) {
        console.error("Failed to save quote", error);
        setSaveError("We couldn't save this quote. Please try again.");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [clientMessage, companyId, dealId, deletedLineItemIds, disclaimer, defaultQuoteNumber, lineItems, quoteId, quoteNumber, status, queryClient]
  );

  const handleDeleteQuote = useCallback(async () => {
    if (isDeleting) return;

    if (!quoteId) {
      navigate(`/deals/${dealId}`);
      return;
    }

    setIsDeleting(true);
    setSaveError(null);

    try {
      await deleteQuote(dealId, quoteId);
      // Invalidate proposal data cache so quote count is updated
      queryClient.invalidateQueries({
        queryKey: ['dealDetail', 'proposalData', dealId],
        exact: false
      });
      navigate(`/deals/${dealId}`);
    } catch (error) {
      console.error("Failed to delete quote", error);
      setSaveError("We couldn't delete this quote. Please try again.");
      setIsDeleting(false);
    }
  }, [dealId, isDeleting, quoteId, navigate, queryClient]);

  // ============================================================================
  // Attachment Handlers
  // ============================================================================
  const handleAttachmentsUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!quoteId) {
        setAttachmentsError("Save the quote before uploading attachments.");
        return;
      }

      const selectedFiles = Array.from(files ?? []).filter(Boolean);
      if (selectedFiles.length === 0) return;

      setIsUploadingAttachment(true);
      setAttachmentsError(null);

      let encounteredError: string | null = null;
      let skippedUnsupported = false;

      const uploadTasks: Promise<void>[] = [];

      selectedFiles.forEach((file) => {
        if (!isImageContentType(file.type)) {
          skippedUnsupported = true;
          return;
        }

        const pendingId = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        setPendingUploads((current) => [
          { id: pendingId, previewUrl, fileName: file.name || "attachment" },
          ...current,
        ]);

        const task = (async () => {
          try {
            const thumbnailResult = await createImageThumbnail(file, 512);
            const asset = await attachmentsRepository.uploadAttachment({
              companyId,
              dealId,
              quoteId,
              file,
              thumbnail: thumbnailResult?.blob ?? null,
              thumbnailContentType: thumbnailResult?.contentType ?? null,
            });

            setAttachments((current) => [asset, ...current]);
          } catch (error) {
            console.error("Failed to upload proposal attachment", error);
            encounteredError = "We couldn't upload one or more images. Please try again.";
            throw error;
          } finally {
            setPendingUploads((current) => current.filter((pending) => pending.id !== pendingId));
            URL.revokeObjectURL(previewUrl);
          }
        })();

        uploadTasks.push(task);
      });

      if (uploadTasks.length > 0) {
        await Promise.allSettled(uploadTasks);
      }

      setIsUploadingAttachment(false);

      if (encounteredError || skippedUnsupported) {
        setAttachmentsError(encounteredError ?? "Only image files can be uploaded right now.");
      }
    },
    [attachmentsRepository, companyId, dealId, quoteId]
  );

  const handleAttachmentInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;
      void handleAttachmentsUpload(event.target.files);
      event.target.value = "";
    },
    [handleAttachmentsUpload]
  );

  const handleAttachmentDelete = useCallback(
    async (attachment: ProposalAttachmentAsset) => {
      setAttachmentsError(null);

      try {
        await attachmentsRepository.deleteAttachment({
          attachmentId: attachment.id,
        });
        setAttachments((current) => current.filter((item) => item.id !== attachment.id));
      } catch (error) {
        console.error("Failed to delete proposal attachment", error);
        setAttachmentsError("We couldn't delete that attachment. Please try again.");
      }
    },
    [attachmentsRepository]
  );

  const handleOpenAttachment = useCallback((index: number) => {
    setActiveAttachmentIndex(index);
  }, []);

  const handleCloseAttachment = useCallback(() => {
    setActiveAttachmentIndex(null);
  }, []);

  const handleStepAttachment = useCallback(
    (direction: -1 | 1) => {
      setActiveAttachmentIndex((current) => {
        if (current === null || imageAttachments.length === 0) return current;
        const nextIndex = (current + direction + imageAttachments.length) % imageAttachments.length;
        return nextIndex;
      });
    },
    [imageAttachments.length]
  );

  // ============================================================================
  // Send Dialog Handlers
  // ============================================================================
  const openSendDialog = useCallback(
    (options?: { variant?: "proposal" | "change_order"; changeOrderNumber?: string | null }) => {
      // Prevent sending proposals with zero total value
      if (totals.total <= 0) {
        setSendError("Cannot send a proposal with a total value of $0. Please add line items first.");
        return;
      }

      const variant = options?.variant ?? "proposal";
      const template = variant === "change_order" ? changeOrderTemplate : proposalTemplate;
      setSendContext(variant);
      setActiveChangeOrderNumber(options?.changeOrderNumber ?? null);
      setEmailRecipient(clientEmail);
      setEmailCc("");
      setEmailSubject(template.emailSubject || "");
      setEmailBody(template.emailBody || "");
      setTextRecipient(clientPhone?.trim() || "");
      setTextBody(template.smsBody || "");
      setSendError(null);
      setSendSuccessMessage(null);
      setIsSendDialogOpen(true);
    },
    [changeOrderTemplate, clientEmail, clientPhone, proposalTemplate, totals.total]
  );

  const closeSendDialog = useCallback(() => {
    setIsSendDialogOpen(false);
    setIsSendingProposal(false);
    setSendContext("proposal");
    setActiveChangeOrderNumber(null);
    setSendError(null);
  }, []);

  const handleSendProposal = useCallback(async () => {
    setIsSendingProposal(true);
    setSendError(null);
    setSendSuccessMessage(null);

    try {
      let effectiveQuoteId = quoteId;

      if (!effectiveQuoteId) {
        const saved = await handleSaveQuote();
        effectiveQuoteId = saved?.id;
      }

      if (!effectiveQuoteId) {
        setSendError("Save the quote before sending it.");
        setIsSendingProposal(false);
        return;
      }

      const shouldSendEmail = sendMethod === "email" || sendMethod === "both";
      const shouldSendText = sendMethod === "text" || sendMethod === "both";

      if (shouldSendEmail && (!emailRecipient.trim() || !emailSubject.trim() || !emailBody.trim())) {
        setSendError("Email delivery requires recipient, subject, and body.");
        setIsSendingProposal(false);
        return;
      }

      if (shouldSendText && (!textRecipient.trim() || !textBody.trim())) {
        setSendError("SMS delivery requires recipient phone and message.");
        setIsSendingProposal(false);
        return;
      }

      if (!shouldSendEmail && !shouldSendText) {
        setSendError("Select at least one delivery method.");
        setIsSendingProposal(false);
        return;
      }

      const shareUrl = getBrowserProposalShareUrl(publicShareId, origin);
      const [firstName, ...restName] = clientName.trim().split(" ");
      const lastName = restName.join(" ");
      const activeQuoteNumber = quoteNumber?.trim() || defaultQuoteNumber;
      const activeTemplate = sendContext === "change_order" ? changeOrderTemplate : proposalTemplate;

      const templateVars = {
        company_name: companyName,
        companyName,
        company_phone: companyBranding?.phone ?? "",
        companyPhone: companyBranding?.phone ?? "",
        company_website: companyBranding?.website ?? "",
        companyWebsite: companyBranding?.website ?? "",
        customer_name: clientName,
        client_name: clientName,
        first_name: firstName || clientName || "Client",
        last_name: lastName,
        quote_number: activeQuoteNumber,
        proposal_button: shareUrl ?? "",
        change_order_number: activeChangeOrderNumber ?? "",
        change_order_button: shareUrl ?? "",
      };

      const renderedEmailSubject = shouldSendEmail
        ? renderCommunicationTemplate(emailSubject.trim() || activeTemplate.emailSubject || "", templateVars)
        : "";
      const renderedEmailBody = shouldSendEmail
        ? renderCommunicationTemplate(emailBody || activeTemplate.emailBody || "", templateVars)
        : "";
      const renderedSmsBody = shouldSendText
        ? renderCommunicationTemplate(textBody || activeTemplate.smsBody || "", templateVars)
        : "";

      const payload: QuoteDeliveryRequestPayload = {
        method: sendMethod,
        email: shouldSendEmail
          ? {
              to: emailRecipient.trim(),
              cc: emailCc.trim() || null,
              subject: renderedEmailSubject.trim(),
              body: renderedEmailBody,
            }
          : undefined,
        text: shouldSendText
          ? {
              to: textRecipient.trim(),
              body: renderedSmsBody,
            }
          : undefined,
      };

      const data = await sendQuoteDelivery(dealId, effectiveQuoteId, payload);

      if (data && "quoteStatus" in data && typeof data.quoteStatus === "string" && data.quoteStatus !== status) {
        setStatus(data.quoteStatus as QuoteRecord["status"]);
      } else if (status === "draft") {
        setStatus("sent");
      }

      const sentEmail = Boolean(data && "sentEmail" in data && data.sentEmail);
      const sentText = Boolean(data && "sentText" in data && data.sentText);

      const successLabel = sendContext === "change_order" ? "Change order" : "Proposal";
      const successMessage =
        sentEmail && sentText
          ? `${successLabel} emailed and texted to the customer.`
          : sentText
            ? `${successLabel} texted to the customer.`
            : `${successLabel} emailed to the customer.`;

      setSendSuccessMessage(successMessage);
      setIsSendDialogOpen(false);
    } catch (error) {
      console.error("Failed to send proposal", error);
      setSendSuccessMessage(null);
      setSendError(error instanceof Error ? error.message : "We couldn't send this proposal. Please try again.");
    } finally {
      setIsSendingProposal(false);
    }
  }, [
    activeChangeOrderNumber,
    changeOrderTemplate,
    companyBranding?.phone,
    companyBranding?.website,
    companyName,
    clientName,
    defaultQuoteNumber,
    dealId,
    emailBody,
    emailCc,
    emailRecipient,
    emailSubject,
    handleSaveQuote,
    proposalTemplate,
    origin,
    publicShareId,
    sendContext,
    quoteNumber,
    quoteId,
    sendMethod,
    status,
    textBody,
    textRecipient,
  ]);

  // ============================================================================
  // Work Order Handlers
  // ============================================================================
  const handleWorkOrderSendRequest = useCallback(
    (options: { method: WorkOrderDeliveryMethod; variant: "standard" | "secret" }) => {
      if (!quoteId) {
        setWorkOrderSendError("Save the quote before sending a work order.");
        setWorkOrderSendSuccess(null);
        return;
      }

      setWorkOrderDialogState(options);
      setWorkOrderSendError(null);
      setWorkOrderSendSuccess(null);
    },
    [quoteId]
  );

  const handleWorkOrderDeliverySubmit = useCallback(
    async (payload: WorkOrderDeliveryRequestPayload) => {
      if (!quoteId) {
        setWorkOrderSendError("Save the quote before sending a work order.");
        return;
      }

      setIsSendingWorkOrder(true);
      setWorkOrderSendError(null);

      try {
        await workOrderDeliveryRepository.sendWorkOrder({
          dealId,
          quoteId,
          ...payload,
        });

        const channelLabel = payload.method === "email" ? "emailed" : payload.method === "text" ? "sent via SMS" : "sent";
        const variantLabel = payload.variant === "secret" ? "Secret work order" : "Work order";
        setWorkOrderSendSuccess(`${variantLabel} ${channelLabel}.`);
        setWorkOrderDialogState(null);
      } catch (error) {
        setWorkOrderSendError(error instanceof Error ? error.message : "Failed to send work order.");
        setWorkOrderSendSuccess(null);
      } finally {
        setIsSendingWorkOrder(false);
      }
    },
    [dealId, quoteId, workOrderDeliveryRepository]
  );

  const closeWorkOrderDialog = useCallback(() => {
    setWorkOrderDialogState(null);
  }, []);

  // ============================================================================
  // Accept Without Signature Handler
  // ============================================================================
  const handleAcceptWithoutSignature = useCallback(async () => {
    if (isAcceptingWithoutSignature) return;
    if (!quoteId) {
      setAcceptWithoutSignatureError("Save the quote before accepting it.");
      return;
    }

    setIsAcceptingWithoutSignature(true);
    setAcceptWithoutSignatureError(null);

    try {
      const result = await acceptQuoteWithoutSignature(quoteId);
      setStatus(result.status as QuoteRecord["status"]);
      if (result.invoiceId) {
        setInvoiceUrl(`/deals/${dealId}/invoices/${result.invoiceId}`);
      }
    } catch (error) {
      console.error("Failed to accept quote without signature", error);
      setAcceptWithoutSignatureError(
        error instanceof Error ? error.message : "Failed to accept quote. Please try again."
      );
    } finally {
      setIsAcceptingWithoutSignature(false);
    }
  }, [dealId, isAcceptingWithoutSignature, quoteId]);

  // ============================================================================
  // Navigation Handlers
  // ============================================================================
  const handleBackToDeal = useCallback(() => {
    if (isNavigatingBack) return;
    setIsNavigatingBack(true);
    navigate(`/deals/${dealId}`);
  }, [dealId, isNavigatingBack, navigate]);

  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue = useMemo<QuoteFormContextValue>(
    () => ({
      // Props
      companyId,
      companyName,
      dealId,
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
      companyBranding,
      taxRate,
      isArchived,

      // State
      state: {
        quoteId,
        publicShareId,
        status,
        quoteNumber,
        createdAt,
        clientMessage,
        disclaimer,
        lineItems,
        editingLineItems,
        isSaving,
        saveError,
        lastSavedAt,
        hasPendingChanges,
        isDeleting,
        isProposalLocked,
        productTemplateOptions,
      },
      attachments: {
        attachments,
        pendingUploads,
        imageAttachments,
        error: attachmentsError,
        isUploading: isUploadingAttachment,
        deletingId: deletingAttachmentId,
        activeIndex: activeAttachmentIndex,
      },
      sendDialog: {
        isOpen: isSendDialogOpen,
        context: sendContext,
        method: sendMethod,
        emailRecipient,
        emailCc,
        emailSubject,
        emailBody,
        textRecipient,
        textBody,
        activeChangeOrderNumber,
        isSending: isSendingProposal,
        error: sendError,
        successMessage: sendSuccessMessage,
      },
      workOrder: {
        dialogState: workOrderDialogState,
        isSending: isSendingWorkOrder,
        error: workOrderSendError,
        successMessage: workOrderSendSuccess,
        shareUrl: workOrderShareUrl,
        secretShareUrl: secretWorkOrderShareUrl,
        currentDefaults: currentWorkOrderDefaults,
        currentUrl: currentWorkOrderUrl,
      },
      computed: {
        totals,
        statusLabel,
        statusClass: STATUS_STYLES[status],
        customerViewUrl,
        shareDisabledReason,
        displayQuoteNumber,
        lastSavedLabel,
        invoiceUrl,
      },

      // UI State
      isNavigatingBack,

      // Actions - Quote Form
      setQuoteNumber,
      setClientMessage,
      setDisclaimer,
      toggleLineItemEdit,
      handleAddLineItem,
      handleAddDiscount,
      handleLineItemFieldChange,
      handleLineItemUnitPriceChange,
      handleApplyTemplate,
      handleDeleteLineItem,
      handleSaveQuote,
      handleDeleteQuote,

      // Actions - Attachments
      handleAttachmentInputChange,
      handleAttachmentDelete,
      handleOpenAttachment,
      handleCloseAttachment,
      handleStepAttachment,

      // Actions - Send Dialog
      openSendDialog,
      closeSendDialog,
      setSendMethod,
      setSendEmailRecipient: setEmailRecipient,
      setSendEmailCc: setEmailCc,
      setSendEmailSubject: setEmailSubject,
      setSendEmailBody: setEmailBody,
      setSendTextRecipient: setTextRecipient,
      setSendTextBody: setTextBody,
      handleSendProposal,

      // Actions - Work Order
      handleWorkOrderSendRequest,
      handleWorkOrderDeliverySubmit,
      closeWorkOrderDialog,

      // Actions - Navigation/UI
      handleBackToDeal,

      // Actions - Accept without signature
      handleAcceptWithoutSignature,
      isAcceptingWithoutSignature,
      acceptWithoutSignatureError,
    }),
    [
      companyId,
      companyName,
      dealId,
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
      companyBranding,
      taxRate,
      isArchived,
      quoteId,
      publicShareId,
      status,
      quoteNumber,
      createdAt,
      clientMessage,
      disclaimer,
      lineItems,
      editingLineItems,
      isSaving,
      saveError,
      lastSavedAt,
      hasPendingChanges,
      isDeleting,
      isProposalLocked,
      productTemplateOptions,
      attachments,
      pendingUploads,
      imageAttachments,
      attachmentsError,
      isUploadingAttachment,
      deletingAttachmentId,
      activeAttachmentIndex,
      isSendDialogOpen,
      sendContext,
      sendMethod,
      emailRecipient,
      emailCc,
      emailSubject,
      emailBody,
      textRecipient,
      textBody,
      activeChangeOrderNumber,
      isSendingProposal,
      sendError,
      sendSuccessMessage,
      workOrderDialogState,
      isSendingWorkOrder,
      workOrderSendError,
      workOrderSendSuccess,
      workOrderShareUrl,
      secretWorkOrderShareUrl,
      currentWorkOrderDefaults,
      currentWorkOrderUrl,
      totals,
      statusLabel,
      customerViewUrl,
      shareDisabledReason,
      displayQuoteNumber,
      lastSavedLabel,
      invoiceUrl,
      isNavigatingBack,
      toggleLineItemEdit,
      handleAddLineItem,
      handleAddDiscount,
      handleLineItemFieldChange,
      handleLineItemUnitPriceChange,
      handleApplyTemplate,
      handleDeleteLineItem,
      handleSaveQuote,
      handleDeleteQuote,
      handleAttachmentInputChange,
      handleAttachmentDelete,
      handleOpenAttachment,
      handleCloseAttachment,
      handleStepAttachment,
      openSendDialog,
      closeSendDialog,
      handleSendProposal,
      handleWorkOrderSendRequest,
      handleWorkOrderDeliverySubmit,
      closeWorkOrderDialog,
      handleBackToDeal,
      handleAcceptWithoutSignature,
      isAcceptingWithoutSignature,
      acceptWithoutSignatureError,
    ]
  );

  return (
    <QuoteFormContext.Provider value={contextValue}>{children}</QuoteFormContext.Provider>
  );
}
