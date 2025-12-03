"use client";

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Textarea,
} from "@/components/ui/library";
import { QUOTE_DELIVERY_METHOD_LABELS, QUOTE_DELIVERY_METHOD_ORDER } from "@/constants/quote-delivery";
import type { QuoteDeliveryMethod } from "@/types/quote-delivery";

export type QuoteSendDialogProps = {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  quoteNumber: string;
  variant?: "proposal" | "change_order";
  changeOrderNumber?: string | null;
  sendMethod: QuoteDeliveryMethod;
  onSendMethodChange: (method: QuoteDeliveryMethod) => void;
  emailRecipient: string;
  onEmailRecipientChange: (value: string) => void;
  emailCc: string;
  onEmailCcChange: (value: string) => void;
  emailSubject: string;
  onEmailSubjectChange: (value: string) => void;
  emailBody: string;
  onEmailBodyChange: (value: string) => void;
  textRecipient: string;
  onTextRecipientChange: (value: string) => void;
  textBody: string;
  onTextBodyChange: (value: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
};

export function QuoteSendDialog({
  open,
  onClose,
  onSend,
  quoteNumber,
  variant = "proposal",
  changeOrderNumber = null,
  sendMethod,
  onSendMethodChange,
  emailRecipient,
  onEmailRecipientChange,
  emailCc,
  onEmailCcChange,
  emailSubject,
  onEmailSubjectChange,
  emailBody,
  onEmailBodyChange,
  textRecipient,
  onTextRecipientChange,
  textBody,
  onTextBodyChange,
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

  if (!open) {
    return null;
  }

  const showEmail = sendMethod === "email" || sendMethod === "both";
  const showText = sendMethod === "text" || sendMethod === "both";
  const sendButtonLabel =
    sendMethod === "both" ? "Send Email & SMS" : sendMethod === "text" ? "Send SMS" : "Send Email";

  return (
    <Modal open={open} onClose={onClose} ariaLabel={heading} size="lg">
      <ModalHeader title={heading} subtitle={description} onClose={onClose} />

      <ModalBody className="space-y-4">
        {errorMessage ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
            {errorMessage}
          </p>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Delivery Method</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {QUOTE_DELIVERY_METHOD_ORDER.map((option) => {
              const isActive = sendMethod === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSendMethodChange(option)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {QUOTE_DELIVERY_METHOD_LABELS[option]}
                </button>
              );
            })}
          </div>
        </section>

        {showEmail ? (
          <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="space-y-3">
              <Input
                type="email"
                label="To"
                value={emailRecipient}
                onChange={(event) => onEmailRecipientChange(event.target.value)}
                placeholder="client@example.com"
                className="bg-white"
              />
              <Input
                type="email"
                label="CC"
                value={emailCc}
                onChange={(event) => onEmailCcChange(event.target.value)}
                placeholder="Optional"
                className="bg-white"
              />
              <Input
                type="text"
                label="Subject"
                value={emailSubject}
                onChange={(event) => onEmailSubjectChange(event.target.value)}
                className="bg-white"
              />
              <Textarea
                label="Message"
                value={emailBody}
                onChange={(event) => onEmailBodyChange(event.target.value)}
                rows={6}
                className="bg-white"
              />
            </div>
          </section>
        ) : null}

        {showText ? (
          <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="space-y-3">
              <Input
                type="tel"
                label="Phone Number"
                value={textRecipient}
                onChange={(event) => onTextRecipientChange(event.target.value)}
                placeholder="+13435551212"
                className="bg-white"
              />
              <Textarea
                label="SMS Message"
                value={textBody}
                onChange={(event) => onTextBodyChange(event.target.value)}
                rows={4}
                hint={variant !== "change_order" ? "We replace {{proposal_button}} with the live proposal link." : undefined}
                className="bg-white"
              />
            </div>
          </section>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSend} loading={isSubmitting} loadingText="Sending...">
          {sendButtonLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
