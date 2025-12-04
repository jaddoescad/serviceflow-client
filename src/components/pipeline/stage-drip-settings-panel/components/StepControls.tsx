import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/library/Modal";
import type { StepControlsProps } from "../types";

export function StepControls({
  isFirst,
  isLast,
  isSaving,
  onMoveUp,
  onMoveDown,
  onDelete,
}: StepControlsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isFirst || isSaving}
          onClick={onMoveUp}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-[12px] text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Move drip earlier"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={isLast || isSaving}
          onClick={onMoveDown}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-[12px] text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Move drip later"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleDeleteClick}
          className="inline-flex h-7 px-2 items-center justify-center rounded border border-rose-200 bg-white text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete drip step?"
        description="This will permanently remove this drip step from the sequence. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
