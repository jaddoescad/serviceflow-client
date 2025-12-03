"use client";

import { formatCurrency } from "@/lib/currency";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from "@/components/ui/library";
import type { InvoiceLineItemRecord } from "@/features/invoices";

type DeleteLineItemDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  submitting: boolean;
  item: InvoiceLineItemRecord | null;
};

export function DeleteLineItemDialog({
  open,
  onClose,
  onConfirm,
  submitting,
  item,
}: DeleteLineItemDialogProps) {
  if (!open || !item) {
    return null;
  }

  const lineTotal = item.quantity * item.unit_price;

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Delete line item" size="sm">
      <ModalHeader
        title="Delete Line Item"
        subtitle="This action cannot be undone."
        onClose={onClose}
      />

      <ModalBody className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="font-medium text-slate-900">{item.name}</p>
          {item.description && (
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          )}
          <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
            <span>
              {item.quantity} x {formatCurrency(item.unit_price)}
            </span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(lineTotal)}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this item? The invoice total will be recalculated.
        </p>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={submitting}
          loadingText="Deleting..."
        >
          Delete Item
        </Button>
      </ModalFooter>
    </Modal>
  );
}
