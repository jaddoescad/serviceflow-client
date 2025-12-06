"use client";

import { useCallback } from "react";
import { SendMessageDialog } from "@/components/messaging";
import type { MessagePayload } from "@/lib/messaging";

export type InvoiceSendDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (payload: MessagePayload) => Promise<void>;
  invoiceNumber: string;
  defaults: {
    emailRecipient: string;
    emailCc?: string;
    emailSubject: string;
    emailBody: string;
    textRecipient: string;
    textBody: string;
  };
  companyEmail?: string | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
};

export function InvoiceSendDialog({
  open,
  onClose,
  onSend,
  invoiceNumber,
  defaults,
  companyEmail,
  isSubmitting,
  errorMessage,
}: InvoiceSendDialogProps) {
  const handleSend = useCallback(
    async (payload: MessagePayload) => {
      await onSend(payload);
    },
    [onSend]
  );

  return (
    <SendMessageDialog
      open={open}
      onClose={onClose}
      onSend={handleSend}
      config={{
        title: `Send Invoice #${invoiceNumber}`,
        description: "Share the invoice link via email, text, or both.",
        showCc: true,
        copyMeEmail: companyEmail,
        ccPlaceholder: "Optional",
      }}
      defaults={{
        recipients: {
          email: defaults.emailRecipient,
          emailCc: defaults.emailCc,
          phone: defaults.textRecipient,
        },
        content: {
          emailSubject: defaults.emailSubject,
          emailBody: defaults.emailBody,
          smsBody: defaults.textBody,
        },
      }}
      isSubmitting={isSubmitting}
      error={errorMessage}
    />
  );
}
