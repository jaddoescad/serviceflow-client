"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Textarea,
} from "@/components/ui/library";
import type {
  DeliveryMethod,
  MessageDialogProps,
  MessagePayload,
} from "@/lib/messaging";

type MethodOption = {
  value: DeliveryMethod;
  label: string;
};

const METHOD_OPTIONS: MethodOption[] = [
  { value: "both", label: "Both Email and Text" },
  { value: "email", label: "Email" },
  { value: "text", label: "Text Message" },
];

export function SendMessageDialog({
  open,
  onClose,
  onSend,
  config,
  defaults,
  isSubmitting,
  error,
}: MessageDialogProps) {
  const {
    title,
    description,
    showCc = false,
    ccPlaceholder = "Optional",
    copyMeEmail,
    sendButtonLabel = "Send",
  } = config;

  // Determine initial method based on available recipients
  const getInitialMethod = useCallback((): DeliveryMethod => {
    const hasEmail = Boolean(defaults.recipients.email);
    const hasPhone = Boolean(defaults.recipients.phone);
    if (hasEmail && hasPhone) return "both";
    if (hasPhone) return "text";
    return "email";
  }, [defaults.recipients.email, defaults.recipients.phone]);

  const [method, setMethod] = useState<DeliveryMethod>(getInitialMethod);
  const [emailTo, setEmailTo] = useState(defaults.recipients.email);
  const [emailCc, setEmailCc] = useState(defaults.recipients.emailCc ?? "");
  const [emailSubject, setEmailSubject] = useState(defaults.content.emailSubject);
  const [emailBody, setEmailBody] = useState(defaults.content.emailBody);
  const [phoneTo, setPhoneTo] = useState(defaults.recipients.phone);
  const [smsBody, setSmsBody] = useState(defaults.content.smsBody);
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset form when dialog opens with new defaults
  useEffect(() => {
    if (open) {
      setMethod(getInitialMethod());
      setEmailTo(defaults.recipients.email);
      setEmailCc(defaults.recipients.emailCc ?? "");
      setEmailSubject(defaults.content.emailSubject);
      setEmailBody(defaults.content.emailBody);
      setPhoneTo(defaults.recipients.phone);
      setSmsBody(defaults.content.smsBody);
      setLocalError(null);
    }
  }, [open, defaults, getInitialMethod]);

  const showEmail = method === "email" || method === "both";
  const showText = method === "text" || method === "both";

  const validate = useCallback((): string | null => {
    if (showEmail) {
      if (!emailTo.trim()) return "Enter an email address.";
      if (!emailSubject.trim()) return "Enter an email subject.";
      if (!emailBody.trim()) return "Enter an email message.";
    }
    if (showText) {
      if (!phoneTo.trim()) return "Enter a phone number.";
      if (!smsBody.trim()) return "Enter a text message.";
    }
    return null;
  }, [showEmail, showText, emailTo, emailSubject, emailBody, phoneTo, smsBody]);

  const handleSend = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);

    const payload: MessagePayload = {
      method,
      email: showEmail
        ? {
            to: emailTo.trim(),
            cc: emailCc.trim() || null,
            subject: emailSubject.trim(),
            body: emailBody,
          }
        : undefined,
      text: showText
        ? {
            to: phoneTo.trim(),
            body: smsBody,
          }
        : undefined,
    };

    await onSend(payload);
  }, [
    validate,
    method,
    showEmail,
    showText,
    emailTo,
    emailCc,
    emailSubject,
    emailBody,
    phoneTo,
    smsBody,
    onSend,
  ]);

  const displayError = localError || error;

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} ariaLabel={title} size="lg">
      <ModalHeader title={title} onClose={onClose}>
        {description && (
          <p className="mt-1 text-[12px] text-slate-600">{description}</p>
        )}
      </ModalHeader>

      <ModalBody className="space-y-4">
        {/* Delivery Method Selector */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Delivery Method
          </label>
          <div className="flex gap-2">
            {METHOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMethod(option.value)}
                className={`flex-1 rounded-md border px-3 py-2 text-[12px] font-medium transition-colors ${
                  method === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {displayError && (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
            {displayError}
          </p>
        )}

        {/* Email Fields */}
        {showEmail && (
          <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Email
            </p>
            <Input
              type="email"
              label="To"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="recipient@example.com"
            />
            {showCc && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    CC
                  </label>
                  {copyMeEmail && (
                    <button
                      type="button"
                      onClick={() => setEmailCc(copyMeEmail)}
                      className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-500"
                    >
                      Copy Me
                    </button>
                  )}
                </div>
                <Input
                  type="email"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  placeholder={ccPlaceholder}
                />
              </div>
            )}
            <Input
              type="text"
              label="Subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <Textarea
              label="Message"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={6}
            />
          </section>
        )}

        {/* SMS Fields */}
        {showText && (
          <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Text Message
            </p>
            <Input
              type="tel"
              label="Phone Number"
              value={phoneTo}
              onChange={(e) => setPhoneTo(e.target.value)}
              placeholder="(555) 123-4567"
            />
            <div>
              <Textarea
                label="Message"
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                rows={3}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {smsBody.length} characters
              </p>
            </div>
          </section>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          loading={isSubmitting}
          loadingText="Sending..."
        >
          {sendButtonLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
