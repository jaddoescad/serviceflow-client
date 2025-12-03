"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui/library";
import { INVOICE_DELIVERY_METHOD_LABELS } from "@/constants/invoice-delivery";
import type { InvoiceDeliveryMethod } from "@/types/invoice-delivery";
import type { SendPaymentRequestDialogProps } from "./types";

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
  const initialMethod: InvoiceDeliveryMethod = useMemo(() => {
    if (clientEmail && clientPhone) {
      return "both";
    }
    if (clientPhone) {
      return "text";
    }
    return "email";
  }, [clientEmail, clientPhone]);

  const [method, setMethod] = useState<InvoiceDeliveryMethod>(initialMethod);
  const [textRecipient, setTextRecipient] = useState(clientPhone);
  const [textBody, setTextBody] = useState(templateDefaults?.smsBody ?? "");
  const [emailRecipient, setEmailRecipient] = useState(clientEmail);
  const [emailCc, setEmailCc] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState(templateDefaults?.emailSubject ?? "");
  const [emailBody, setEmailBody] = useState(templateDefaults?.emailBody ?? "");
  const [textBodyEdited, setTextBodyEdited] = useState(false);
  const [emailSubjectEdited, setEmailSubjectEdited] = useState(false);
  const [emailBodyEdited, setEmailBodyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMethod(initialMethod);
      setTextRecipient(clientPhone);
      setEmailRecipient(clientEmail);
      setEmailCc("");
      setTextBody(templateDefaults?.smsBody ?? "");
      setEmailSubject(templateDefaults?.emailSubject ?? "");
      setEmailBody(templateDefaults?.emailBody ?? "");
      setTextBodyEdited(false);
      setEmailSubjectEdited(false);
      setEmailBodyEdited(false);
      setError(null);
    }
  }, [clientEmail, clientPhone, initialMethod, open, templateDefaults]);

  useEffect(() => {
    if (!open || !templateDefaults) return;
    if (!textBodyEdited) setTextBody(templateDefaults.smsBody ?? "");
    if (!emailSubjectEdited) setEmailSubject(templateDefaults.emailSubject ?? "");
    if (!emailBodyEdited) setEmailBody(templateDefaults.emailBody ?? "");
  }, [emailBodyEdited, emailSubjectEdited, open, templateDefaults, textBodyEdited]);

  const handleSend = async () => {
    if (!request) {
      return;
    }

    if ((method === "both" || method === "text") && (!textRecipient || !textBody.trim())) {
      setError("Enter a phone number and message for the text request.");
      return;
    }

    if ((method === "both" || method === "email") && (!emailRecipient || !emailSubject.trim() || !emailBody.trim())) {
      setError("Email requests require a recipient, subject, and message.");
      return;
    }

    await onSend({
      method,
      text:
        method === "both" || method === "text"
          ? {
              to: textRecipient,
              body: textBody,
            }
          : undefined,
      email:
        method === "both" || method === "email"
          ? {
              to: emailRecipient,
              cc: emailCc || null,
              subject: emailSubject,
              body: emailBody,
            }
          : undefined,
    });
  };

  if (!open || !request) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Send payment request" size="lg">
      <ModalHeader
        title={`Request Payment for Invoice #${request.invoice_id.slice(0, 6).toUpperCase()}`}
        subtitle={`Sending request for ${formatCurrency(request.amount)}.`}
        onClose={onClose}
      />

      <ModalBody className="space-y-3">
        <div className="space-y-2">
          <Select
            id="payment-request-method"
            value={method}
            onChange={(event) => setMethod(event.target.value as InvoiceDeliveryMethod)}
          >
            {(["both", "text", "email"] as InvoiceDeliveryMethod[]).map((value) => (
              <option key={value} value={value}>
                {INVOICE_DELIVERY_METHOD_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
            {error}
          </p>
        ) : null}

        {(method === "both" || method === "text") && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Text Message</h3>
            <div className="mt-2 space-y-2">
              <Input
                type="tel"
                label="To"
                value={textRecipient}
                onChange={(event) => setTextRecipient(event.target.value)}
                placeholder="(613) 327-0016"
                className="bg-white"
              />
              <Textarea
                label="Message"
                value={textBody}
                onChange={(event) => {
                  setTextBodyEdited(true);
                  setTextBody(event.target.value);
                }}
                rows={3}
                className="bg-white"
              />
            </div>
          </section>
        )}

        {(method === "both" || method === "email") && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Email</h3>
            <div className="mt-2 space-y-2">
              <Input
                type="email"
                label="To"
                value={emailRecipient}
                onChange={(event) => setEmailRecipient(event.target.value)}
                placeholder="sheila@example.com"
                className="bg-white"
              />
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    CC
                  </label>
                  {companyEmail ? (
                    <button
                      type="button"
                      onClick={() => setEmailCc(companyEmail)}
                      className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-500"
                    >
                      Copy Me
                    </button>
                  ) : null}
                </div>
                <Input
                  type="email"
                  value={emailCc}
                  onChange={(event) => setEmailCc(event.target.value)}
                  placeholder="Enter your email..."
                  className="bg-white"
                />
              </div>
              <Input
                type="text"
                label="Subject"
                value={emailSubject}
                onChange={(event) => {
                  setEmailSubjectEdited(true);
                  setEmailSubject(event.target.value);
                }}
                className="bg-white"
              />
              <Textarea
                label="Message"
                value={emailBody}
                onChange={(event) => {
                  setEmailBodyEdited(true);
                  setEmailBody(event.target.value);
                }}
                rows={4}
                className="bg-white"
              />
            </div>
          </section>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSend} loading={submitting} loadingText="Sending...">
          Send
        </Button>
      </ModalFooter>
    </Modal>
  );
}
