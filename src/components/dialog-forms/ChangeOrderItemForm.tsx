import type { ChangeOrderItemFormProps } from "../types";

export function ChangeOrderItemForm({
  name,
  description,
  unitPrice,
  editingItemId,
  isSaving,
  productTemplateOptions,
  onNameChange,
  onDescriptionChange,
  onUnitPriceChange,
  onApplyTemplate,
  onSave,
  onCancel,
}: ChangeOrderItemFormProps) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      {productTemplateOptions.length > 0 ? (
        <div className="mb-3">
          <label className="text-xs font-medium text-slate-600">Choose Template</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
            onChange={(event) => {
              const templateId = event.target.value;
              if (templateId) {
                onApplyTemplate(templateId);
              }
            }}
          >
            <option value="">Select a service template</option>
            {productTemplateOptions.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div>
            <label className="text-xs font-medium text-slate-600">Product / Service</label>
            <input
              type="text"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Describe the new work"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Unit Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(event) => onUnitPriceChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Details</label>
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Details or notes for this change"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : editingItemId ? "Update Item" : "Save Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
