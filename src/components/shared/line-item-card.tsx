"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { IconPencil, IconTrash } from "./icons";

// ============================================================================
// Types
// ============================================================================

export type LineItemData = {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
};

export type ReadOnlyLineItemRowProps = {
  name: string;
  description?: string | null;
  price: number;
};

export type EditableLineItemCardProps = {
  name: string;
  description?: string | null;
  price: number;
  index?: number;
  label?: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

// ============================================================================
// Read-Only Line Item Row Component (for proposals, change orders, etc.)
// ============================================================================

export function ReadOnlyLineItemRow({ name, description, price }: ReadOnlyLineItemRowProps) {
  const isDiscount = price < 0;

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className={`text-base font-semibold ${isDiscount ? "text-rose-700" : "text-slate-900"}`}>
          {name}
        </h3>
        {description ? (
          <p className="text-sm text-slate-600 whitespace-pre-line">{description}</p>
        ) : null}
      </div>
      <div className="space-y-1 sm:shrink-0 sm:text-right">
        <label className="text-xs font-medium text-slate-600">
          {isDiscount ? "Discount Amount" : "Price"}
        </label>
        <p className={`text-sm font-semibold ${isDiscount ? "text-rose-600" : "text-slate-900"}`}>
          {formatCurrency(price)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Editable Line Item Card Component (for change orders with edit/delete)
// ============================================================================

export function EditableLineItemCard({
  name,
  description,
  price,
  index,
  label,
  onEdit,
  onDelete
}: EditableLineItemCardProps) {
  const isDiscount = price < 0;
  const showActions = onEdit || onDelete;
  const headerLabel = label ?? (isDiscount ? "Discount" : (index !== undefined ? `Line Item #${index + 1}` : "Line Item"));

  return (
    <div className={`rounded-lg border p-4 ${isDiscount ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide ${isDiscount ? "text-rose-500" : "text-slate-500"}`}>
          {headerLabel}
        </span>
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                title="Edit item"
              >
                <IconPencil />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="cursor-pointer rounded p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                title="Delete item"
              >
                <IconTrash />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className={`text-base font-semibold ${isDiscount ? "text-rose-700" : "text-slate-900"}`}>
            {name || "Untitled Item"}
          </h3>
          {description && (
            <p className="text-sm text-slate-600 whitespace-pre-line">{description}</p>
          )}
        </div>
        <div className="space-y-1 sm:shrink-0 sm:text-right">
          <label className="text-xs font-medium text-slate-600">
            {isDiscount ? "Discount Amount" : "Price"}
          </label>
          <p className={`text-sm font-semibold ${isDiscount ? "text-rose-600" : "text-slate-900"}`}>
            {formatCurrency(price)}
          </p>
        </div>
      </div>
    </div>
  );
}

type ProductTemplate = {
  id: string;
  name: string;
  description?: string | null;
};

type LineItemCardProps = {
  item: LineItemData;
  index?: number;
  isEditing: boolean;
  readOnly?: boolean;
  productTemplates?: ProductTemplate[];
  saveButtonColor?: "blue" | "emerald";
  onEdit: () => void;
  onDelete: () => void;
  onSave: (data: { name: string; description: string | null; unit_price: number }) => void;
  onCancel: () => void;
  onApplyTemplate?: (templateId: string) => void;
  isSaving?: boolean;
};

type NewLineItemCardProps = {
  productTemplates?: ProductTemplate[];
  saveButtonColor?: "blue" | "emerald";
  onSave: (data: { name: string; description: string | null; unit_price: number }) => void;
  onCancel: () => void;
  onApplyTemplate?: (templateId: string) => void;
  isSaving?: boolean;
  isDiscount?: boolean;
};

// ============================================================================
// Inline Edit Form Component
// ============================================================================

type InlineEditFormProps = {
  initialName?: string;
  initialDescription?: string;
  initialPrice?: string;
  productTemplates?: ProductTemplate[];
  saveButtonColor?: "blue" | "emerald";
  onSave: (data: { name: string; description: string | null; unit_price: number }) => void;
  onCancel: () => void;
  onApplyTemplate?: (templateId: string) => void;
  isSaving?: boolean;
  title: string;
  isDiscount?: boolean;
};

function InlineEditForm({
  initialName = "",
  initialDescription = "",
  initialPrice = "",
  productTemplates,
  saveButtonColor = "blue",
  onSave,
  onCancel,
  onApplyTemplate,
  isSaving = false,
  title,
  isDiscount = false,
}: InlineEditFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [unitPrice, setUnitPrice] = useState(initialPrice);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Item name is required.");
      return;
    }

    const parsedPrice = Number.parseFloat(unitPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Amount must be a valid positive number.");
      return;
    }

    // For discounts, negate the price
    const finalPrice = isDiscount ? -Math.abs(parsedPrice) : parsedPrice;

    onSave({
      name: trimmedName,
      description: description.trim() || null,
      unit_price: finalPrice,
    });
  };

  const handleTemplateChange = (templateId: string) => {
    if (!templateId || !productTemplates) return;
    const template = productTemplates.find((t) => t.id === templateId);
    if (!template) return;
    // Update local form state only - parent state is updated on Save
    setName(template.name);
    setDescription(template.description ?? "");
  };

  const buttonColorClass =
    saveButtonColor === "emerald"
      ? "bg-emerald-500 hover:bg-emerald-600"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className={`rounded-lg border p-4 ${isDiscount ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide ${isDiscount ? "text-rose-500" : "text-slate-500"}`}>
          {title}
        </span>
      </div>
      <div className="space-y-3">
        {!isDiscount && productTemplates && productTemplates.length > 0 && onApplyTemplate && (
          <div>
            <label className="text-xs font-medium text-slate-600">Choose Template</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value=""
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">Select a product template</option>
              {productTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-slate-600">
            {isDiscount ? "Discount Name" : "Item Name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isDiscount ? "e.g., Early payment discount" : "e.g., Window cleaning service"}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional details about this item"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            {isDiscount ? "Discount Amount" : "Price"}
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isDiscount ? "text-rose-500" : "text-slate-500"}`}>
              {isDiscount ? "-$" : "$"}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => {
                setUnitPrice(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        {error && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
            {error}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50 ${buttonColorClass}`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Display Card Component
// ============================================================================

type DisplayCardProps = {
  item: LineItemData;
  index?: number;
  readOnly?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function DisplayCard({ item, index, readOnly = false, onEdit, onDelete }: DisplayCardProps) {
  const isDiscount = item.unitPrice < 0;

  return (
    <div className={`rounded-lg border p-4 ${isDiscount ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide ${isDiscount ? "text-rose-500" : "text-slate-500"}`}>
          {isDiscount ? "Discount" : (index !== undefined ? `Line Item #${index + 1}` : "Line Item")}
        </span>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              title="Edit item"
            >
              <IconPencil />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer rounded p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
              title="Delete item"
            >
              <IconTrash />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className={`text-base font-semibold ${isDiscount ? "text-rose-700" : "text-slate-900"}`}>
            {item.name || "Untitled Item"}
          </h3>
          {item.description && (
            <p className="text-sm text-slate-600 whitespace-pre-line">{item.description}</p>
          )}
        </div>
        <div className="space-y-1 sm:shrink-0 sm:text-right">
          <label className="text-xs font-medium text-slate-600">
            {isDiscount ? "Discount Amount" : "Price"}
          </label>
          <p className={`text-sm font-semibold ${isDiscount ? "text-rose-600" : "text-slate-900"}`}>
            {formatCurrency(item.unitPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Line Item Card Component
// ============================================================================

export function LineItemCard({
  item,
  index,
  isEditing,
  readOnly = false,
  productTemplates,
  saveButtonColor = "blue",
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onApplyTemplate,
  isSaving = false,
}: LineItemCardProps) {
  if (isEditing) {
    return (
      <InlineEditForm
        initialName={item.name}
        initialDescription={item.description ?? ""}
        initialPrice={item.unitPrice.toFixed(2)}
        productTemplates={productTemplates}
        saveButtonColor={saveButtonColor}
        onSave={onSave}
        onCancel={onCancel}
        onApplyTemplate={onApplyTemplate}
        isSaving={isSaving}
        title={index !== undefined ? `Edit Line Item #${index + 1}` : "Edit Line Item"}
      />
    );
  }

  return (
    <DisplayCard
      item={item}
      index={index}
      readOnly={readOnly}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

// ============================================================================
// New Line Item Card Component
// ============================================================================

export function NewLineItemCard({
  productTemplates,
  saveButtonColor = "blue",
  onSave,
  onCancel,
  onApplyTemplate,
  isSaving = false,
  isDiscount = false,
}: NewLineItemCardProps) {
  return (
    <InlineEditForm
      productTemplates={productTemplates}
      saveButtonColor={saveButtonColor}
      onSave={onSave}
      onCancel={onCancel}
      onApplyTemplate={onApplyTemplate}
      isSaving={isSaving}
      title={isDiscount ? "New Discount" : "New Line Item"}
      isDiscount={isDiscount}
    />
  );
}
