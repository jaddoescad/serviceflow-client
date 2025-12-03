import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EditableQuoteLineItem,
  QuoteRecord,
  UpsertQuoteInput,
  UpsertQuoteLineItemInput,
  SaveQuotePayload,
} from "@/features/quotes";
import type { ProductTemplateRecord } from "@/features/products";
import { QUOTE_DEFAULT_CLIENT_MESSAGE, QUOTE_DEFAULT_DISCLAIMER, createQuote } from "@/features/quotes";
import { parseUnitPrice, createClientId } from "@/lib/form-utils";
import { mapRecordToEditable, createEmptyLineItem } from "../utils";

type UseQuoteFormStateProps = {
  companyId: string;
  dealId: string;
  initialQuote: QuoteRecord | null;
  defaultQuoteNumber: string;
  productTemplates: ProductTemplateRecord[];
  isArchived?: boolean;
};

export function useQuoteFormState({
  companyId,
  dealId,
  initialQuote,
  defaultQuoteNumber,
  productTemplates,
  isArchived = false,
}: UseQuoteFormStateProps) {
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

        return saved;
      } catch (error) {
        console.error("Failed to save quote", error);
        setSaveError("We couldn't save this quote. Please try again.");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [
      clientMessage,
      companyId,
      dealId,
      deletedLineItemIds,
      disclaimer,
      defaultQuoteNumber,
      lineItems,
      quoteId,
      quoteNumber,
      status,
    ]
  );

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

  return {
    // State
    quoteId,
    publicShareId,
    status,
    setStatus,
    quoteNumber,
    setQuoteNumber,
    createdAt,
    clientMessage,
    setClientMessage,
    disclaimer,
    setDisclaimer,
    lineItems,
    editingLineItems,
    isSaving,
    saveError,
    setSaveError,
    lastSavedAt,
    hasPendingChanges,
    isDeleting,
    setIsDeleting,
    isProposalLocked,
    productTemplateOptions,

    // Actions
    toggleLineItemEdit,
    handleAddLineItem,
    handleLineItemFieldChange,
    handleLineItemUnitPriceChange,
    handleApplyTemplate,
    handleDeleteLineItem,
    handleSaveQuote,
  };
}
