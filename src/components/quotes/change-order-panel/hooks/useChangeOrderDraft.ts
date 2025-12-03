import { useCallback, useEffect, useMemo, useState } from "react";
import { createClientId } from "@/lib/form-utils";
import type { ChangeOrderRecord } from "@/types/change-orders";
import type { InvoiceRecord } from "@/features/invoices";
import { useCreateChangeOrder, useAcceptChangeOrder } from "@/hooks/useChangeOrders";
import type { ChangeOrderItem } from "../types";
import { formatChangeOrderLabel, mapSavedItems, calculateActiveSequence } from "../utils";

type UseChangeOrderDraftOptions = {
  companyId: string;
  dealId: string;
  quoteId?: string;
  quoteNumber: string;
  changeOrders: ChangeOrderRecord[];
  quoteInvoice: InvoiceRecord | null;
  onChangeOrdersUpdate: (saved: ChangeOrderRecord) => void;
  onLoadChangeOrders: (options?: { silent?: boolean }) => Promise<void>;
  setAcceptingId: (id: string | null) => void;
  setError: (error: string | null) => void;
  setMessage: (message: string | null) => void;
};

export function useChangeOrderDraft({
  companyId,
  dealId,
  quoteId,
  quoteNumber,
  changeOrders,
  quoteInvoice,
  onChangeOrdersUpdate,
  onLoadChangeOrders,
  setAcceptingId,
  setError,
  setMessage,
}: UseChangeOrderDraftOptions) {
  const [items, setItems] = useState<ChangeOrderItem[]>([]);
  const [draftChangeOrderId, setDraftChangeOrderId] = useState<string | null>(null);
  const [draftChangeOrderNumber, setDraftChangeOrderNumber] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");

  // React Query mutations
  const createMutation = useCreateChangeOrder(dealId);
  const acceptMutation = useAcceptChangeOrder(dealId);

  const isSaving = createMutation.isPending;
  const parsedUnitPrice = Math.max(0, Number.parseFloat(unitPrice) || 0);

  // Load pending change order into editor
  useEffect(() => {
    if (!quoteId) return;
    const pendingForQuote = changeOrders.filter(
      (order) => order.quote_id === quoteId && order.status === "pending"
    );
    if (pendingForQuote.length === 0) return;

    if (draftChangeOrderId && pendingForQuote.some((order) => order.id === draftChangeOrderId)) {
      return;
    }

    const latest = pendingForQuote[pendingForQuote.length - 1];
    setDraftChangeOrderId(latest.id);
    setDraftChangeOrderNumber(latest.change_order_number ?? null);
    setItems(mapSavedItems(latest));
  }, [changeOrders, draftChangeOrderId, quoteId]);

  // Clear draft state if tracked draft no longer exists or is no longer pending
  useEffect(() => {
    if (!draftChangeOrderId) return;
    const stillPending = changeOrders.some(
      (order) => order.id === draftChangeOrderId && order.status === "pending"
    );
    if (!stillPending) {
      setDraftChangeOrderId(null);
      setDraftChangeOrderNumber(null);
      setItems([]);
    }
  }, [changeOrders, draftChangeOrderId]);

  // Clear leftover draft items if no pending change order remains
  useEffect(() => {
    if (!quoteId) return;
    const hasPending = changeOrders.some(
      (order) => order.quote_id === quoteId && order.status === "pending"
    );
    if (!hasPending && !draftChangeOrderId && items.length > 0) {
      setItems([]);
      setDraftChangeOrderNumber(null);
    }
  }, [changeOrders, draftChangeOrderId, items.length, quoteId]);

  const activeSequence = useMemo(
    () => calculateActiveSequence(changeOrders, quoteNumber),
    [changeOrders, quoteNumber]
  );

  const activeLabel = useMemo(
    () => draftChangeOrderNumber ?? formatChangeOrderLabel(quoteNumber, activeSequence),
    [draftChangeOrderNumber, quoteNumber, activeSequence]
  );

  const resetForm = useCallback(() => {
    setEditingItemId(null);
    setName("");
    setDescription("");
    setUnitPrice("0");
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!name.trim()) {
      setError("Enter a product or service name.");
      return;
    }

    if (parsedUnitPrice <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    const nextItem: ChangeOrderItem = {
      id: editingItemId ?? createClientId(),
      name: name.trim(),
      description: description.trim(),
      unitPrice: parsedUnitPrice,
    };

    if (!quoteId) {
      setError("Save the proposal before adding change orders.");
      return;
    }

    const nextItems = items.some((existing) => existing.id === nextItem.id)
      ? items.map((existing) => (existing.id === nextItem.id ? nextItem : existing))
      : [...items, nextItem];

    // Store previous state for rollback on error
    const previousItems = items;
    const previousShowForm = showForm;
    const wasEditing = editingItemId;

    // Optimistic update
    setItems(nextItems);
    setShowForm(false);
    setError(null);
    setMessage(editingItemId ? "Change order item updated." : "Change order item added.");
    resetForm();

    const payload = {
      company_id: companyId,
      deal_id: dealId,
      quote_id: quoteId,
      invoice_id: quoteInvoice?.id ?? null,
      change_order_number: activeLabel,
      items: nextItems.map((item, index) => ({
        name: item.name,
        description: item.description || null,
        unit_price: item.unitPrice,
        unitPrice: item.unitPrice,
        position: index,
      })),
    };

    try {
      const saved = await createMutation.mutateAsync(payload);
      setDraftChangeOrderId(saved?.id ?? draftChangeOrderId);
      setDraftChangeOrderNumber(saved?.change_order_number ?? activeLabel);
      const syncedItems = mapSavedItems(saved);
      setItems(syncedItems.length > 0 ? syncedItems : nextItems);
      setShowForm(false);
      setMessage("Change order saved.");
      onChangeOrdersUpdate(saved);
    } catch (err) {
      // Revert optimistic update on error
      setItems(previousItems);
      setShowForm(previousShowForm);
      if (wasEditing) {
        const itemToRestore = previousItems.find((i) => i.id === wasEditing);
        if (itemToRestore) {
          setEditingItemId(wasEditing);
          setName(itemToRestore.name);
          setDescription(itemToRestore.description);
          setUnitPrice(String(itemToRestore.unitPrice));
        }
      }
      setError(err instanceof Error ? err.message : "Failed to save change order.");
    }
  }, [
    name,
    parsedUnitPrice,
    editingItemId,
    quoteId,
    items,
    showForm,
    resetForm,
    companyId,
    dealId,
    quoteInvoice?.id,
    activeLabel,
    draftChangeOrderId,
    createMutation,
    onChangeOrdersUpdate,
    setError,
    setMessage,
  ]);

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!quoteId) return;

      const nextItems = items.filter((item) => item.id !== itemId);

      // Store previous state for rollback
      const previousItems = items;

      // Optimistic update
      setItems(nextItems);
      setError(null);
      setMessage("Item deleted.");

      // If no items left, we don't need to save - the change order will be empty
      if (nextItems.length === 0) {
        // Clear the draft state since there are no items
        setDraftChangeOrderId(null);
        setDraftChangeOrderNumber(null);
        return;
      }

      const payload = {
        company_id: companyId,
        deal_id: dealId,
        quote_id: quoteId,
        invoice_id: quoteInvoice?.id ?? null,
        change_order_number: activeLabel,
        items: nextItems.map((item, index) => ({
          name: item.name,
          description: item.description || null,
          unit_price: item.unitPrice,
          unitPrice: item.unitPrice,
          position: index,
        })),
      };

      try {
        const saved = await createMutation.mutateAsync(payload);
        setDraftChangeOrderId(saved?.id ?? draftChangeOrderId);
        setDraftChangeOrderNumber(saved?.change_order_number ?? activeLabel);
        const syncedItems = mapSavedItems(saved);
        setItems(syncedItems.length > 0 ? syncedItems : nextItems);
        onChangeOrdersUpdate(saved);
      } catch (err) {
        // Revert optimistic update on error
        setItems(previousItems);
        setError(err instanceof Error ? err.message : "Failed to delete item.");
      }
    },
    [
      quoteId,
      items,
      companyId,
      dealId,
      quoteInvoice?.id,
      activeLabel,
      draftChangeOrderId,
      createMutation,
      onChangeOrdersUpdate,
      setError,
      setMessage,
    ]
  );

  const handleAcceptDraft = useCallback(async () => {
    if (!draftChangeOrderId) return;
    if (!quoteInvoice) {
      setError("Invoice not found for this proposal. Accept the proposal to generate its invoice.");
      return;
    }

    try {
      setAcceptingId(draftChangeOrderId);
      setError(null);
      setMessage(null);
      const saved = await acceptMutation.mutateAsync({
        changeOrderId: draftChangeOrderId,
        payload: { invoice_id: quoteInvoice.id },
      });
      setItems([]);
      setDraftChangeOrderId(null);
      setDraftChangeOrderNumber(null);
      setMessage("Change order accepted and added to the invoice.");
      onChangeOrdersUpdate(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept change order.");
    } finally {
      setAcceptingId(null);
    }
  }, [
    draftChangeOrderId,
    quoteInvoice,
    setAcceptingId,
    setError,
    setMessage,
    acceptMutation,
    onChangeOrdersUpdate,
  ]);

  const handleEditItem = useCallback((item: ChangeOrderItem) => {
    setEditingItemId(item.id);
    setName(item.name);
    setDescription(item.description);
    setUnitPrice(String(item.unitPrice));
    setShowForm(true);
  }, []);

  const handleApplyTemplate = useCallback(
    (templateId: string, templates: { id: string; name: string; description?: string | null }[]) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;
      setName(template.name);
      setDescription(template.description ?? "");
      if (!editingItemId) {
        setUnitPrice("0");
      }
    },
    [editingItemId]
  );

  return {
    items,
    draftChangeOrderId,
    draftChangeOrderNumber,
    showForm,
    setShowForm,
    editingItemId,
    name,
    setName,
    description,
    setDescription,
    unitPrice,
    setUnitPrice,
    isSaving,
    activeLabel,
    handleSaveItem,
    handleDeleteItem,
    handleAcceptDraft,
    handleEditItem,
    handleApplyTemplate,
    resetForm,
  };
}
