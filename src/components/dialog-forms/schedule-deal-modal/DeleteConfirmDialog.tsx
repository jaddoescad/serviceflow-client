import { ConfirmDialog } from "@/components/ui/library";

type DeleteConfirmDialogProps = {
  open: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteConfirmDialog({
  open,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Appointment"
      description="Are you sure you want to delete this appointment? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      loading={isDeleting}
    />
  );
}
