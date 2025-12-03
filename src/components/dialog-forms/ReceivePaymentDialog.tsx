"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
} from "@/components/ui/library";
import type { ReceivePaymentDialogProps } from "./types";

export function ReceivePaymentDialog({
  open,
  onClose,
  onSubmit,
  submitting,
  defaultAmount,
  defaultDate,
  clientEmail,
  defaultReceiptBody,
  defaultReceiptSubject,
  paymentRequestId,
}: ReceivePaymentDialogProps) {
  const [amount, setAmount] = useState<string>(defaultAmount.toFixed(2));
  const [receivedAt, setReceivedAt] = useState<string>(defaultDate);
  const [method, setMethod] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [sendReceipt, setSendReceipt] = useState<boolean>(Boolean(clientEmail));
  const [receiptEmail, setReceiptEmail] = useState<string>(clientEmail);
  const [receiptSubject, setReceiptSubject] = useState<string>(defaultReceiptSubject || "Payment Receipt");
  const [receiptBody, setReceiptBody] = useState<string>(defaultReceiptBody);
  const [receiptSubjectEdited, setReceiptSubjectEdited] = useState(false);
  const [receiptBodyEdited, setReceiptBodyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(defaultAmount.toFixed(2));
      setReceivedAt(defaultDate);
      setMethod("");
      setReference("");
      setNote("");
      setSendReceipt(Boolean(clientEmail));
      setReceiptEmail(clientEmail);
      setReceiptSubject(defaultReceiptSubject || "Payment Receipt");
      setReceiptBody(defaultReceiptBody);
      setReceiptSubjectEdited(false);
      setReceiptBodyEdited(false);
      setError(null);
    }
  }, [clientEmail, defaultAmount, defaultDate, defaultReceiptBody, defaultReceiptSubject, open]);

  useEffect(() => {
    if (!open) return;
    if (!receiptSubjectEdited) {
      setReceiptSubject(defaultReceiptSubject || "Payment Receipt");
    }
    if (!receiptBodyEdited) {
      setReceiptBody(defaultReceiptBody);
    }
  }, [defaultReceiptBody, defaultReceiptSubject, open, receiptBodyEdited, receiptSubjectEdited]);

  const handleSubmit = async () => {
    const amountValue = Number.parseFloat(amount || "0");

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }

    if (!receivedAt || Number.isNaN(Date.parse(receivedAt))) {
      setError("Enter a valid received date.");
      return;
    }

    if (sendReceipt && (!receiptEmail || !receiptEmail.trim())) {
      setError("Enter an email address to send the receipt.");
      return;
    }

    if (sendReceipt && (!receiptBody || !receiptBody.trim())) {
      setError("Add a message for the email receipt or disable the receipt option.");
      return;
    }

    await onSubmit({
      amount: amountValue,
      receivedAt,
      method: method || null,
      reference: reference.trim() || null,
      note: note.trim() || null,
      sendReceipt,
      receiptEmail: sendReceipt ? receiptEmail.trim() : null,
      receiptSubject: sendReceipt ? receiptSubject.trim() : null,
      receiptBody: sendReceipt ? receiptBody.trim() : null,
      paymentRequestId,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Receive payment" size="lg">
      <ModalHeader title="Receive Payment" onClose={onClose} />

      <ModalBody className="space-y-4">
        <div className="grid gap-3">
          <Input
            type="date"
            label="Date Received"
            value={receivedAt}
            onChange={(event) => setReceivedAt(event.target.value)}
          />

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">$</span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <Select
            label="Method"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option value="">Select a method...</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="e_transfer">E-Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit">Debit</option>
            <option value="other">Other</option>
          </Select>

          <Input
            type="text"
            label="Ref Number"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />

          <Textarea
            label="Note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Add an additional note about this payment..."
          />

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <Checkbox
              label="Send Email Receipt"
              checked={sendReceipt}
              onChange={(event) => setSendReceipt(event.target.checked)}
            />

            {sendReceipt ? (
              <div className="mt-3 space-y-2">
                <Input
                  type="email"
                  label="Email Receipt"
                  value={receiptEmail}
                  onChange={(event) => setReceiptEmail(event.target.value)}
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
                <div>
                  <Textarea
                    label="Message"
                    hint="Deposit Payment"
                    value={receiptBody}
                    onChange={(event) => {
                      setReceiptBodyEdited(true);
                      setReceiptBody(event.target.value);
                    }}
                    rows={4}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={submitting} loadingText="Saving...">
          Record Payment
        </Button>
      </ModalFooter>
    </Modal>
  );
}
