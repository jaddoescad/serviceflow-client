import { useCallback, useState } from "react";
import type {
  MessageContent,
  MessageDialogConfig,
  MessagePayload,
  MessageRecipients,
} from "@/lib/messaging";

export type UseMessageSendOptions = {
  /** Function to call when sending the message */
  sendFn: (payload: MessagePayload) => Promise<void>;
  /** Called after successful send */
  onSuccess?: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
};

export type UseMessageSendReturn = {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Whether currently sending */
  isSubmitting: boolean;
  /** Current error message */
  error: string | null;
  /** Dialog configuration */
  config: MessageDialogConfig | null;
  /** Default recipients */
  recipients: MessageRecipients | null;
  /** Default content */
  content: MessageContent | null;
  /** Open the dialog with config and defaults */
  open: (params: {
    config: MessageDialogConfig;
    recipients: MessageRecipients;
    content: MessageContent;
  }) => void;
  /** Close the dialog */
  close: () => void;
  /** Handle sending - validates and calls sendFn */
  send: (payload: MessagePayload) => Promise<void>;
};

/**
 * Hook for managing message send dialog state.
 *
 * Usage:
 * ```tsx
 * const messageSend = useMessageSend({
 *   sendFn: async (payload) => {
 *     await api.sendInvoice(invoiceId, payload);
 *   },
 *   onSuccess: () => {
 *     toast.success("Message sent!");
 *   },
 * });
 *
 * // Open dialog
 * messageSend.open({
 *   config: { title: "Send Invoice" },
 *   recipients: { email: "client@example.com", phone: "555-1234" },
 *   content: { emailSubject: "Your Invoice", emailBody: "...", smsBody: "..." },
 * });
 *
 * // In render
 * <SendMessageDialog
 *   open={messageSend.isOpen}
 *   onClose={messageSend.close}
 *   onSend={messageSend.send}
 *   config={messageSend.config!}
 *   defaults={{ recipients: messageSend.recipients!, content: messageSend.content! }}
 *   isSubmitting={messageSend.isSubmitting}
 *   error={messageSend.error}
 * />
 * ```
 */
export function useMessageSend(options: UseMessageSendOptions): UseMessageSendReturn {
  const { sendFn, onSuccess, onError } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<MessageDialogConfig | null>(null);
  const [recipients, setRecipients] = useState<MessageRecipients | null>(null);
  const [content, setContent] = useState<MessageContent | null>(null);

  const open = useCallback(
    (params: {
      config: MessageDialogConfig;
      recipients: MessageRecipients;
      content: MessageContent;
    }) => {
      setConfig(params.config);
      setRecipients(params.recipients);
      setContent(params.content);
      setError(null);
      setIsOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const send = useCallback(
    async (payload: MessagePayload) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await sendFn(payload);
        setIsOpen(false);
        onSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send message.";
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
      } finally {
        setIsSubmitting(false);
      }
    },
    [sendFn, onSuccess, onError]
  );

  return {
    isOpen,
    isSubmitting,
    error,
    config,
    recipients,
    content,
    open,
    close,
    send,
  };
}
