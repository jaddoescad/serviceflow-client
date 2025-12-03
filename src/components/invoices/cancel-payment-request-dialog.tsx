import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from "@/components/ui/library";
import { formatCurrency } from "@/lib/currency";
import type { InvoicePaymentRequestRecord } from "@/features/invoices";

type CancelPaymentRequestDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  request: InvoicePaymentRequestRecord | null;
  isSubmitting: boolean;
};

export function CancelPaymentRequestDialog({
  open,
  onClose,
  onConfirm,
  request,
  isSubmitting,
}: CancelPaymentRequestDialogProps) {
  if (!open || !request) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Cancel payment request" size="sm">
      <ModalHeader title="Cancel Payment Request?" onClose={onClose} />
      <ModalBody className="text-center text-sm text-slate-600">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <svg
            className="h-6 w-6 text-rose-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="mt-3">
          Are you sure you want to cancel and delete the payment request for{" "}
          <span className="font-medium text-slate-900">{formatCurrency(request.amount)}</span>? This action will
          remove it permanently and cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter className="gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} fullWidth>
          Keep Request
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          loading={isSubmitting}
          loadingText="Cancelling..."
          fullWidth
        >
          Yes, Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
