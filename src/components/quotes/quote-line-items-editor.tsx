import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { parseUnitPrice } from "@/lib/form-utils";
import { ChangeOrderPanel } from "./change-order-panel";
import { IconPencil, IconTrash, TotalsSummary } from "@/components/shared";
import { ConfirmDialog } from "@/components/ui/library/Modal";
import type { ProductTemplateRecord } from "@/features/products";
import type { EditableQuoteLineItem } from "@/features/quotes";

type QuoteLineItemsEditorProps = {
    companyId: string;
    dealId: string;
    quoteId: string | undefined;
    lineItems: EditableQuoteLineItem[];
    editingLineItems: Set<string>;
    productTemplateOptions: ProductTemplateRecord[];
    readOnly?: boolean;
    readOnlyReason?: "accepted" | "archived";
    quoteNumber?: string;
    taxRate?: number;
    customerViewUrl?: string | null;
    totals: {
        subtotal: number;
        tax: number;
        taxRate: number;
        total: number;
    };
    onLineItemChange: (clientId: string, field: "name" | "description", value: string) => void;
    onLineItemUnitPriceChange: (clientId: string, value: string) => void;
    onAddLineItem: () => void;
    onAddDiscount: () => void;
    onDeleteLineItem: (clientId: string) => void;
    onToggleEdit: (clientId: string) => void;
    onCancelEdit: (clientId: string) => void;
    onApplyTemplate: (clientId: string, templateId: string) => void;
    onSave: () => void;
    onSendProposal?: () => void;
    onSendChangeOrder?: (changeOrderNumber: string) => void;
};

export function QuoteLineItemsEditor({
    lineItems,
    editingLineItems,
    productTemplateOptions,
    readOnly = false,
    readOnlyReason,
    quoteNumber,
    taxRate = 0,
    customerViewUrl = null,
    totals,
    onLineItemChange,
    onLineItemUnitPriceChange,
    onAddLineItem,
    onAddDiscount,
    onDeleteLineItem,
    onToggleEdit,
    onCancelEdit,
    onApplyTemplate,
    onSave,
    companyId,
    dealId,
    quoteId,
    onSendChangeOrder,
}: QuoteLineItemsEditorProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; clientId: string | null; itemName: string }>({
        open: false,
        clientId: null,
        itemName: "",
    });

    const handleDeleteClick = (clientId: string, itemName: string) => {
        setDeleteConfirm({ open: true, clientId, itemName });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm.clientId) {
            onDeleteLineItem(deleteConfirm.clientId);
        }
        setDeleteConfirm({ open: false, clientId: null, itemName: "" });
    };

    const handleCancelDelete = () => {
        setDeleteConfirm({ open: false, clientId: null, itemName: "" });
    };

    return (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-slate-900">Products & Services</h2>
                {readOnly ? (
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        readOnlyReason === "archived"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                    }`}>
                        <svg className={`h-3 w-3 ${readOnlyReason === "archived" ? "text-amber-500" : "text-slate-500"}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 6.5L8 3l5 3.5v6.5a1 1 0 01-1 1H4a1 1 0 01-1-1V6.5z" strokeLinejoin="round" />
                            <path d="M6.5 9.5L8 11l1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {readOnlyReason === "archived" ? "Archived deal · read-only" : "Accepted proposal · read-only"}
                    </span>
                ) : null}
            </div>
            {readOnly ? (
                <p className="mt-2 text-[12px] text-slate-600">
                    {readOnlyReason === "archived"
                        ? "This deal has been archived. Line items are locked."
                        : "This proposal has been accepted. Line items are locked to preserve the signed version."}
                </p>
            ) : null}
            <div className="mt-4 space-y-4">
                {lineItems.map((item, index) => {
                    const isEditing = !readOnly && editingLineItems.has(item.client_id);
                    const isDiscount = item.isDiscount || parseUnitPrice(item.unitPrice) < 0;
                    return (
                        <div key={item.client_id} className={`rounded-lg border p-4 ${isDiscount ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                            <div className="flex items-start justify-between mb-3">
                                <span className={`text-xs font-semibold uppercase tracking-wide ${isDiscount ? "text-rose-500" : "text-slate-500"}`}>
                                    {isDiscount ? "Discount" : `Line Item #${index + 1}`}
                                </span>
                                {!readOnly ? (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onToggleEdit(item.client_id)}
                                            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                                        >
                                            <IconPencil />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(item.client_id, item.name || "Untitled item")}
                                            className="cursor-pointer rounded p-1 text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                                        >
                                            <IconTrash />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            {isEditing ? (
                                <div className="space-y-3">
                                    {!isDiscount && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-600">Choose Template</label>
                                            <select
                                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value=""
                                                onChange={(event) => {
                                                    onApplyTemplate(item.client_id, event.target.value);
                                                    event.currentTarget.selectedIndex = 0;
                                                }}
                                            >
                                                <option value="">Select a product template</option>
                                                {productTemplateOptions.map((template) => (
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
                                            value={item.name}
                                            onChange={(event) => onLineItemChange(item.client_id, "name", event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={isDiscount ? "e.g., Early payment discount" : "Service name"}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-600">Description (optional)</label>
                                        <textarea
                                            value={item.description}
                                            onChange={(event) => onLineItemChange(item.client_id, "description", event.target.value)}
                                            rows={3}
                                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe the work that will be completed"
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
                                                value={isDiscount ? Math.abs(parseUnitPrice(item.unitPrice)).toString() : item.unitPrice}
                                                onChange={(event) => {
                                                    const val = event.target.value;
                                                    if (isDiscount) {
                                                        const num = parseFloat(val) || 0;
                                                        onLineItemUnitPriceChange(item.client_id, (-Math.abs(num)).toString());
                                                    } else {
                                                        onLineItemUnitPriceChange(item.client_id, val);
                                                    }
                                                }}
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onToggleEdit(item.client_id);
                                                onSave();
                                            }}
                                            className="cursor-pointer rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onCancelEdit(item.client_id)}
                                            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <h3 className={`text-base font-semibold ${isDiscount ? "text-rose-700" : "text-slate-900"}`}>
                                            {item.name || "Untitled Service"}
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
                                            {formatCurrency(parseUnitPrice(item.unitPrice))}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {!readOnly ? (
                <div className="mt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onAddLineItem}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 cursor-pointer"
                    >
                        + Add Line Item
                    </button>
                    <button
                        type="button"
                        onClick={onAddDiscount}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                    >
                        <span className="mr-1.5 text-rose-500 font-bold">−</span>
                        Add Discount
                    </button>
                </div>
            ) : null}
            {readOnly && quoteNumber ? (
                <div className="mt-6">
                    <ChangeOrderPanel
                        companyId={companyId}
                        dealId={dealId}
                        quoteId={quoteId}
                        quoteNumber={quoteNumber}
                        taxRate={taxRate ?? totals.taxRate}
                        productTemplateOptions={productTemplateOptions}
                        customerViewUrl={customerViewUrl ?? null}
                        onSendChangeOrder={(changeOrderNumber) =>
                            (onSendChangeOrder ?? (() => undefined))(changeOrderNumber)
                        }
                    />
                </div>
            ) : null}
            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
                <div className="w-full max-w-xs space-y-1 text-right">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {totals.taxRate > 0 && (
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Tax ({totals.taxRate}%)</span>
                            <span>{formatCurrency(totals.tax)}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-sm font-semibold text-slate-900">
                        <span>Total</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={deleteConfirm.open}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete line item?"
                description={`Are you sure you want to delete "${deleteConfirm.itemName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
            />
        </section>
    );
}
