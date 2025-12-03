import { useState } from "react";
import { Button } from "@/components/ui/library";
import { IconPlus, LineItemCard, NewLineItemCard, TotalsSummary } from "@/components/shared";
import { useInvoiceDetailContext } from "./InvoiceDetailContext";
import type { InvoiceLineItemRecord } from "@/features/invoices";

export function LineItemsTable() {
  const ctx = useInvoiceDetailContext();
  const { state, computed } = ctx;

  const invoice = state.invoice;
  const totals = computed.totals;
  const isArchived = state.isArchived;

  const canEdit = !isArchived;

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<"item" | "discount" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveItem = async (data: { name: string; description: string | null; unit_price: number }) => {
    setIsSaving(true);
    try {
      await ctx.handleLineItemSubmit({
        name: data.name,
        description: data.description,
        quantity: 1,
        unit_price: data.unit_price,
      });
      setEditingItemId(null);
      setIsAddingNew(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    setIsAddingNew("item");
    setEditingItemId(null);
  };

  const handleAddDiscount = () => {
    setIsAddingNew("discount");
    setEditingItemId(null);
  };

  const handleEditItem = (item: InvoiceLineItemRecord) => {
    ctx.openEditLineItemDialog(item);
    setEditingItemId(item.id);
    setIsAddingNew(null);
    ctx.closeLineItemDialog();
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setIsAddingNew(null);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Line Items</h3>
        {canEdit && !isAddingNew && !editingItemId && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleAddItem}>
              <IconPlus className="mr-1.5 h-4 w-4" />
              Add Item
            </Button>
            <Button variant="secondary" size="sm" onClick={handleAddDiscount}>
              <span className="mr-1.5 text-rose-500 font-bold">−</span>
              Add Discount
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {invoice.line_items.length === 0 && !isAddingNew ? (
          <div className="py-4 text-center text-slate-500 text-sm">
            No line items yet.{" "}
            {canEdit && (
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Add one now
              </button>
            )}
          </div>
        ) : (
          invoice.line_items.map((item) => (
            <LineItemCard
              key={item.id}
              item={{
                id: item.id,
                name: item.name,
                description: item.description,
                unitPrice: item.unit_price,
              }}
              isEditing={editingItemId === item.id}
              readOnly={!canEdit}
              saveButtonColor="blue"
              onEdit={() => handleEditItem(item)}
              onDelete={() => ctx.openDeleteLineItemDialog(item)}
              onSave={handleSaveItem}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
            />
          ))
        )}

        {isAddingNew && (
          <NewLineItemCard
            saveButtonColor="blue"
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            isDiscount={isAddingNew === "discount"}
          />
        )}
      </div>

      <TotalsSummary
        subtotal={totals.subtotal}
        total={totals.total}
        balanceDue={totals.balance}
      />
    </section>
  );
}
