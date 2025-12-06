"use client";

import { useCallback } from "react";
import { formatCurrency } from "@/lib/currency";
import { SendMessageDialog } from "@/components/messaging";
import type { MessagePayload } from "@/lib/messaging";
import type { SendPaymentRequestDialogProps } from "@/components/invoices/invoice-detail/types";

export function SendPaymentRequestDialog({
  open,
  onClose,
  onSend,
  submitting,
  request,
  templateDefaults,
  clientPhone,
  clientEmail,
  companyEmail,
}: SendPaymentRequestDialogProps) {
  const handleSend = useCallback(
    async (payload: MessagePayload) => {
      await onSend({
        method: payload.method,
        text: payload.text,
        email: payload.email,
      });
    },
    [onSend]
  );

  if (!request || !templateDefaults) {
    return null;
  }

  return (
    <SendMessageDialog
      open={open}
      onClose={onClose}
      onSend={handleSend}
      config={{
        title: `Request Payment for Invoice #${request.invoice_id.slice(0, 6).toUpperCase()}`,
        description: `Sending request for ${formatCurrency(request.amount)}.`,
        showCc: true,
        copyMeEmail: companyEmail,
        ccPlaceholder: "Enter your email...",
      }}
      defaults={{
        recipients: {
          email: clientEmail,
          phone: clientPhone,
        },
        content: {
          emailSubject: templateDefaults.emailSubject,
          emailBody: templateDefaults.emailBody,
          smsBody: templateDefaults.smsBody,
        },
      }}
      isSubmitting={submitting}
    />
  );
}
