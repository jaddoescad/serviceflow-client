"use client";

import { useCallback } from "react";
import { formatCurrency } from "@/lib/currency";
import { SendMessageDialog } from "@/components/messaging";
import type { MessagePayload } from "@/lib/messaging";
import type { SendPaymentReceiptDialogProps } from "@/components/invoices/invoice-detail/types";

export function SendPaymentReceiptDialog({
  open,
  onClose,
  onSend,
  submitting,
  payment,
  defaultBody,
  defaultSubject,
  clientEmail,
}: SendPaymentReceiptDialogProps) {
  const handleSend = useCallback(
    async (payload: MessagePayload) => {
      if (!payment || !payload.email) return;

      await onSend({
        receiptEmail: payload.email.to,
        receiptSubject: payload.email.subject,
        receiptBody: payload.email.body,
      });
    },
    [onSend, payment]
  );

  if (!open || !payment) {
    return null;
  }

  const receivedDate = new Date(payment.received_at).toLocaleDateString();

  return (
    <SendMessageDialog
      open={open}
      onClose={onClose}
      onSend={handleSend}
      config={{
        title: "Resend Payment Confirmation",
        description: `Send another receipt for ${formatCurrency(payment.amount)} received on ${receivedDate}.`,
        showCc: false,
        sendButtonLabel: "Send Confirmation",
      }}
      defaults={{
        recipients: {
          email: clientEmail,
          phone: "", // Empty to force email-only mode
        },
        content: {
          emailSubject: defaultSubject || "Payment Receipt",
          emailBody: defaultBody,
          smsBody: "",
        },
      }}
      isSubmitting={submitting}
    />
  );
}
