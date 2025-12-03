import { useMemo } from "react";
import type { ChangeOrderPanelProps } from "./types";
import { useChangeOrders } from "./hooks/useChangeOrders";
import { useChangeOrderDraft } from "./hooks/useChangeOrderDraft";
import { ChangeOrderCard, DraftChangeOrderSection } from "./components";

export type { ChangeOrderPanelProps } from "./types";

export function ChangeOrderPanel({
  companyId,
  dealId,
  quoteId,
  quoteNumber,
  taxRate,
  productTemplateOptions,
  customerViewUrl,
  onSendChangeOrder,
}: ChangeOrderPanelProps) {
  const {
    changeOrders,
    quoteInvoice,
    isLoading,
    loadError,
    acceptingId,
    setAcceptingId,
    error,
    setError,
    message,
    setMessage,
    loadChangeOrders,
    handleAcceptExisting,
    updateChangeOrdersLocally,
  } = useChangeOrders({ dealId, quoteId });

  const {
    items,
    draftChangeOrderId,
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
  } = useChangeOrderDraft({
    companyId,
    dealId,
    quoteId,
    quoteNumber,
    changeOrders,
    quoteInvoice,
    onChangeOrdersUpdate: updateChangeOrdersLocally,
    onLoadChangeOrders: loadChangeOrders,
    setAcceptingId,
    setError,
    setMessage,
  });

  const sortedChangeOrders = useMemo(() => {
    return changeOrders
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [changeOrders]);

  const visibleChangeOrders = useMemo(
    () => sortedChangeOrders.filter((order) => order.status === "accepted"),
    [sortedChangeOrders]
  );

  const hasDraftItems = items.length > 0;
  const hasPendingDraft = Boolean(draftChangeOrderId);

  return (
    <div className="flex flex-col gap-6">
      {loadError ? <p className="text-sm font-medium text-rose-600">{loadError}</p> : null}

      {isLoading ? (
        <p className="text-sm text-slate-600">Loading change orders...</p>
      ) : visibleChangeOrders.length === 0 && !hasPendingDraft ? (
        <p className="text-sm text-slate-600">
          No change orders yet. Add items below to create the first one.
        </p>
      ) : (
        visibleChangeOrders.map((order) => (
          <ChangeOrderCard
            key={order.id}
            order={order}
            taxRate={taxRate}
            acceptingId={acceptingId}
            quoteInvoice={quoteInvoice}
            onAccept={handleAcceptExisting}
          />
        ))
      )}

      <DraftChangeOrderSection
        items={items}
        activeLabel={activeLabel}
        quoteId={quoteId}
        taxRate={taxRate}
        showForm={showForm}
        message={message}
        error={error}
        isSaving={isSaving}
        hasDraftItems={hasDraftItems}
        hasPendingDraft={hasPendingDraft}
        draftChangeOrderId={draftChangeOrderId}
        acceptingId={acceptingId}
        quoteInvoice={quoteInvoice}
        productTemplateOptions={productTemplateOptions}
        formState={{
          name,
          description,
          unitPrice,
          editingItemId,
        }}
        onShowForm={() => setShowForm(true)}
        onHideForm={() => {
          setShowForm(false);
          setError(null);
          resetForm();
        }}
        onFormChange={(field, value) => {
          if (field === "name") setName(value);
          else if (field === "description") setDescription(value);
          else if (field === "unitPrice") setUnitPrice(value);
        }}
        onApplyTemplate={(templateId) => handleApplyTemplate(templateId, productTemplateOptions)}
        onSaveItem={handleSaveItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        onSendChangeOrder={() => onSendChangeOrder(activeLabel)}
        onAcceptDraft={handleAcceptDraft}
      />
    </div>
  );
}
