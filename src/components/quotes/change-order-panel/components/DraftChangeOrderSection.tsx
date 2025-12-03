import type { DraftChangeOrderSectionProps } from "../types";
import { ChangeOrderTable } from "./ChangeOrderTable";
import { ChangeOrderItemForm } from "@/components/dialog-forms/ChangeOrderItemForm";

export function DraftChangeOrderSection({
  items,
  activeLabel,
  quoteId,
  taxRate,
  showForm,
  message,
  error,
  isSaving,
  hasDraftItems,
  hasPendingDraft,
  draftChangeOrderId,
  acceptingId,
  quoteInvoice,
  productTemplateOptions,
  formState,
  onShowForm,
  onHideForm,
  onFormChange,
  onApplyTemplate,
  onSaveItem,
  onEditItem,
  onSendChangeOrder,
  onAcceptDraft,
  onDeleteItem,
}: DraftChangeOrderSectionProps) {
  const isAcceptingDraft =
    acceptingId !== null && draftChangeOrderId !== null && acceptingId === draftChangeOrderId;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Change Order
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Change Order #{activeLabel}
          </h3>
          {!quoteId ? (
            <p className="text-xs text-amber-600">
              Save the proposal before creating change orders.
            </p>
          ) : null}
        </div>
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-sm font-medium text-rose-600">{error}</p> : null}

      {showForm ? (
        <ChangeOrderItemForm
          name={formState.name}
          description={formState.description}
          unitPrice={formState.unitPrice}
          editingItemId={formState.editingItemId}
          isSaving={isSaving}
          productTemplateOptions={productTemplateOptions}
          onNameChange={(value) => onFormChange("name", value)}
          onDescriptionChange={(value) => onFormChange("description", value)}
          onUnitPriceChange={(value) => onFormChange("unitPrice", value)}
          onApplyTemplate={onApplyTemplate}
          onSave={onSaveItem}
          onCancel={onHideForm}
        />
      ) : null}

      <div className="mt-5">
        <ChangeOrderTable
          items={items}
          taxRate={taxRate}
          showActions
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onShowForm}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100"
        >
          Add Item
        </button>
        <button
          type="button"
          onClick={onSendChangeOrder}
          disabled={items.length === 0}
          className="inline-flex items-center justify-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
        {quoteInvoice ? (
          <button
            type="button"
            onClick={onAcceptDraft}
            disabled={!hasDraftItems || !draftChangeOrderId || isAcceptingDraft}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAcceptingDraft ? "Accepting..." : "Accept & Add to Invoice"}
          </button>
        ) : (
          <p className="text-xs text-slate-500">
            Accept the proposal to generate its invoice before accepting change orders.
          </p>
        )}
      </div>
    </section>
  );
}
