/**
 * Unified Messaging Types
 *
 * Shared types for all message sending functionality across the application.
 * Used by invoices, proposals, payment requests, work orders, etc.
 */

export type DeliveryMethod = "email" | "text" | "both";

export type MessageRecipients = {
  email: string;
  emailCc?: string | null;
  phone: string;
};

export type MessageContent = {
  emailSubject: string;
  emailBody: string;
  smsBody: string;
};

export type MessagePayload = {
  method: DeliveryMethod;
  email?: {
    to: string;
    cc?: string | null;
    subject: string;
    body: string;
  };
  text?: {
    to: string;
    body: string;
  };
};

export type MessageDialogConfig = {
  /** Title shown in dialog header */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Whether to show CC field for email */
  showCc?: boolean;
  /** Placeholder for CC field */
  ccPlaceholder?: string;
  /** Email to use for "Copy Me" button (if provided, shows the button) */
  copyMeEmail?: string | null;
  /** Label for the send button */
  sendButtonLabel?: string;
};

export type MessageDialogState = {
  method: DeliveryMethod;
  emailTo: string;
  emailCc: string;
  emailSubject: string;
  emailBody: string;
  phoneTo: string;
  smsBody: string;
};

export type MessageDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: (payload: MessagePayload) => Promise<void>;
  config: MessageDialogConfig;
  defaults: {
    recipients: MessageRecipients;
    content: MessageContent;
  };
  isSubmitting: boolean;
  error?: string | null;
};
