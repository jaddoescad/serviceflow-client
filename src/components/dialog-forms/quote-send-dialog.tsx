"use client";

import { useCallback } from "react";
import { SendMessageDialog } from "@/components/messaging";
import type { MessagePayload } from "@/lib/messaging";

export type QuoteSendDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (payload: MessagePayload) => Promise<void>;
  quoteNumber: string;
  variant?: "proposal" | "change_order";
  changeOrderNumber?: string | null;
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

export function QuoteSendDialog({
  open,
  onClose,
  onSend,
  quoteNumber,
  variant = "proposal",
  changeOrderNumber = null,
  defaults,
  companyEmail,
  isSubmitting,
  errorMessage,
}: QuoteSendDialogProps) {
  const heading =
    variant === "change_order"
      ? `Send Change Order${changeOrderNumber ? ` #${changeOrderNumber}` : ""}`
      : `Send Proposal #${quoteNumber}`;
  const description =
    variant === "change_order"
      ? "Share the change order link via email, text, or both."
      : "Share the proposal link via email, text, or both.";

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
        title: heading,
        description,
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
