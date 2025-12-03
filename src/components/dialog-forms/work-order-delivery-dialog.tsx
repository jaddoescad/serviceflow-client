"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Textarea,
} from "@/components/ui/library";
import type { WorkOrderDeliveryMethod, WorkOrderDeliveryRequestPayload } from "@/types/work-order-delivery";

export type WorkOrderDeliveryDialogProps = {
  open: boolean;
  onClose: () => void;
  method: WorkOrderDeliveryMethod;
  variant: "standard" | "secret";
  defaults: { smsBody: string; emailSubject: string; emailBody: string };
  workOrderUrl: string | null;
  companyName: string;
  clientName: string;
  workOrderAddress: string;
  onSend: (payload: WorkOrderDeliveryRequestPayload) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
};

export function WorkOrderDeliveryDialog({
  open,
  onClose,
  method,
  variant,
  defaults,
  workOrderUrl,
  companyName,
  clientName,
  workOrderAddress,
  onSend,
  isSubmitting,
  errorMessage,
}: WorkOrderDeliveryDialogProps) {
  const isEmail = method === "email" || method === "both";
  const isText = method === "text" || method === "both";
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState(defaults.emailSubject);
  const [emailBody, setEmailBody] = useState(defaults.emailBody);
  const [textTo, setTextTo] = useState("");
  const [textBody, setTextBody] = useState(defaults.smsBody);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLocalError(null);
      return;
    }

    setEmailSubject(defaults.emailSubject);
    setEmailBody(defaults.emailBody);
    setTextBody(defaults.smsBody);
    setLocalError(null);
  }, [defaults.emailBody, defaults.emailSubject, defaults.smsBody, open]);

  useEffect(() => {
    if (!open) {
      setEmailTo("");
      setTextTo("");
    }
  }, [open]);

  const handleCopyLink = useCallback(() => {
    if (!workOrderUrl) {
      return;
    }

    navigator.clipboard
      .writeText(workOrderUrl)
      .catch((error) => console.error("Failed to copy work order link", error));
  }, [workOrderUrl]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isEmail) {
        if (!emailTo.trim()) {
          setLocalError("Enter an email address.");
          return;
        }
        if (!emailSubject.trim()) {
          setLocalError("Add an email subject.");
          return;
        }
        if (!emailBody.trim()) {
          setLocalError("Add an email body.");
          return;
        }
      }

      if (isText) {
        if (!textTo.trim()) {
          setLocalError("Enter a phone number.");
          return;
        }
        if (!textBody.trim()) {
          setLocalError("Add a message body.");
          return;
        }
      }

      setLocalError(null);

      const payload: WorkOrderDeliveryRequestPayload = {
        method,
        variant,
        email: isEmail
          ? {
              to: emailTo.trim(),
              subject: emailSubject.trim(),
              body: emailBody,
            }
          : null,
        text: isText
          ? {
              to: textTo.trim(),
              body: textBody,
            }
          : null,
      };

      void onSend(payload);
    },
    [
      emailBody,
      emailSubject,
      emailTo,
      isEmail,
      isText,
      method,
      onSend,
      textBody,
      textTo,
      variant,
    ]
  );

  if (!open) {
    return null;
  }

  const variantLabel = variant === "secret" ? "Secret" : "Standard";
  const displayError = localError || errorMessage;

  return (
    <Modal open={open} onClose={onClose} ariaLabel={`${variantLabel} Work Order`} size="lg">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <ModalHeader title={`${variantLabel} Work Order`} onClose={onClose}>
          <p className="mt-1 text-[12px] text-slate-600">
            Send this link to crew members. Update the message before sending if needed.
          </p>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
            <p className="font-semibold text-slate-800">{clientName}</p>
            <p>{companyName}</p>
            <p className="whitespace-pre-line">{workOrderAddress}</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-2 py-1 text-[11px] text-slate-600">
                {workOrderUrl ?? "Link unavailable"}
              </code>
              <Button
                variant="secondary"
                size="xs"
                onClick={handleCopyLink}
                disabled={!workOrderUrl}
              >
                Copy
              </Button>
            </div>
          </div>

          {displayError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
              {displayError}
            </p>
          ) : null}

          {isEmail ? (
            <section className="space-y-3">
              <Input
                type="email"
                label="To"
                value={emailTo}
                onChange={(event) => setEmailTo(event.target.value)}
                placeholder="crew@example.com"
              />
              <Input
                type="text"
                label="Subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
              />
              <Textarea
                label="Email Body"
                value={emailBody}
                onChange={(event) => setEmailBody(event.target.value)}
                rows={8}
              />
            </section>
          ) : null}

          {isText ? (
            <section className="space-y-3">
              <Input
                type="tel"
                label="Phone"
                value={textTo}
                onChange={(event) => setTextTo(event.target.value)}
                placeholder="(555) 123-4567"
              />
              <Textarea
                label="Message"
                value={textBody}
                onChange={(event) => setTextBody(event.target.value)}
                rows={4}
              />
            </section>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Sending...">
            Send
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
