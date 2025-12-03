"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/currency";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Textarea,
} from "@/components/ui/library";
import type { SendPaymentReceiptDialogProps } from "./types";

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
  const [receiptEmail, setReceiptEmail] = useState<string>(clientEmail);
  const [receiptSubject, setReceiptSubject] = useState<string>(defaultSubject || "Payment Receipt");
  const [receiptBody, setReceiptBody] = useState<string>(defaultBody);
  const [receiptSubjectEdited, setReceiptSubjectEdited] = useState(false);
  const [receiptBodyEdited, setReceiptBodyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReceiptEmail(clientEmail);
      setReceiptSubject(defaultSubject || "Payment Receipt");
      setReceiptBody(defaultBody);
      setReceiptSubjectEdited(false);
      setReceiptBodyEdited(false);
      setError(null);
    }
  }, [clientEmail, defaultBody, defaultSubject, open]);

  useEffect(() => {
    if (!open) return;
    if (!receiptSubjectEdited) {
      setReceiptSubject(defaultSubject || "Payment Receipt");
    }
    if (!receiptBodyEdited) {
      setReceiptBody(defaultBody);
    }
  }, [defaultBody, defaultSubject, open, receiptBodyEdited, receiptSubjectEdited]);

  const handleSend = async () => {
    if (!payment) {
      return;
    }

    if (!receiptEmail || !receiptEmail.trim()) {
      setError("Enter an email address for the receipt.");
      return;
    }

    if (!receiptSubject || !receiptSubject.trim()) {
      setError("Enter a subject for the receipt email.");
      return;
    }

    if (!receiptBody || !receiptBody.trim()) {
      setError("Add a message for the receipt email.");
      return;
    }

    await onSend({
      receiptEmail: receiptEmail.trim(),
      receiptSubject: receiptSubject.trim(),
      receiptBody: receiptBody,
    });
  };

  if (!open || !payment) {
    return null;
  }

  const receivedDate = new Date(payment.received_at).toLocaleDateString();

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Send payment receipt" size="lg">
      <ModalHeader
        title="Resend Payment Confirmation"
        subtitle={`Send another receipt for ${formatCurrency(payment.amount)} received on ${receivedDate}.`}
        onClose={onClose}
      />

      {error ? (
        <div className="mx-5 mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
          {error}
        </div>
      ) : null}

      <ModalBody className="space-y-3">
        <Input
          type="email"
          label="To"
          value={receiptEmail}
          onChange={(event) => setReceiptEmail(event.target.value)}
          placeholder="customer@example.com"
        />
        <Input
          type="text"
          label="Subject"
          value={receiptSubject}
          onChange={(event) => {
            setReceiptSubjectEdited(true);
            setReceiptSubject(event.target.value);
          }}
        />
        <Textarea
          label="Message"
          value={receiptBody}
          onChange={(event) => {
            setReceiptBodyEdited(true);
            setReceiptBody(event.target.value);
          }}
          rows={6}
        />
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSend} loading={submitting} loadingText="Sending...">
          Send Confirmation
        </Button>
      </ModalFooter>
    </Modal>
  );
}
