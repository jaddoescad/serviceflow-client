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
  Textarea,
} from "@/components/ui/library";
import type { RequestPaymentDialogProps } from "./types";

export function RequestPaymentDialog({
  open,
  onClose,
  balanceDue,
  total,
  onSubmit,
  submitting,
}: RequestPaymentDialogProps) {
  const defaultOptions = useMemo(() => {
    const base = balanceDue > 0 ? balanceDue : total;
    return [0.25, 0.5, 0.75, 1].map((fraction) => ({
      label: `${Math.round(fraction * 100)}%`,
      value: Number((base * fraction).toFixed(2)),
    }));
  }, [balanceDue, total]);

  const [selectedAmount, setSelectedAmount] = useState<number>(() => Number(balanceDue.toFixed(2)));
  const [customAmount, setCustomAmount] = useState<string>(balanceDue.toFixed(2));
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const initial = Number(balanceDue.toFixed(2));
      setSelectedAmount(initial);
      setCustomAmount(initial.toFixed(2));
      setNote("");
      setError(null);
    }
  }, [balanceDue, open]);

  const handleSelectOption = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toFixed(2));
    setError(null);
  };

  const handleSubmit = async () => {
    const amountValue = Number.parseFloat(customAmount || "0");

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }

    if (amountValue > balanceDue + 0.01) {
      setError("Requested amount cannot exceed the current balance due.");
      return;
    }

    await onSubmit({ amount: amountValue, note: note.trim() || null });
  };

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Request payment" size="md">
      <ModalHeader
        title="Request Payment"
        subtitle={`Choose an amount to request based on the remaining balance (${formatCurrency(balanceDue)}).`}
        onClose={onClose}
      />

      <ModalBody className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {defaultOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleSelectOption(option.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition hover:border-blue-400 hover:text-blue-600 ${
                Math.abs(option.value - selectedAmount) < 0.01
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {option.label} ({formatCurrency(option.value)})
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Custom Amount
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">$</span>
            <Input
              type="number"
              step={0.01}
              min={0}
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setError(null);
              }}
              placeholder="0.00"
              className="flex-1"
            />
          </div>
        </div>

        <Textarea
          label="Note (optional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
        />

        {error ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
            {error}
          </p>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={submitting} loadingText="Creating...">
          Create Request
        </Button>
      </ModalFooter>
    </Modal>
  );
}
