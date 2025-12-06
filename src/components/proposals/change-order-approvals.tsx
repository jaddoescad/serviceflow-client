"use client";

import { useCallback, useState, useEffect } from "react";
import { acceptChangeOrder } from "@/services/change-orders";
import { formatCurrency } from "@/lib/currency";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/library";
import { SignaturePad, type SignatureData } from "@/components/ui/signature-pad";

type ChangeOrderItem = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
};

type ChangeOrder = {
  id: string;
  change_order_number: string;
  status: string;
  items: ChangeOrderItem[];
  signer_name?: string | null;
  signature_text?: string | null;
  signature_type?: "type" | "draw" | null;
};

type ChangeOrderApprovalsProps = {
  changeOrders: ChangeOrder[];
  invoiceId: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  readOnly?: boolean;
};

export function ChangeOrderApprovals({ changeOrders, invoiceId, customerName, customerEmail, readOnly = false }: ChangeOrderApprovalsProps) {
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signatureModalId, setSignatureModalId] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<SignatureData>({ mode: "type", value: "" });
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [changeOrdersState, setChangeOrdersState] = useState<ChangeOrder[]>(changeOrders ?? []);

  useEffect(() => {
    setChangeOrdersState(changeOrders ?? []);
    setSignatureData({ mode: "type", value: "" });
    setSignatureError(null);
  }, [changeOrders]);

  const pending = (changeOrdersState ?? []).filter((order) => order.status === "pending");
  const accepted = (changeOrdersState ?? []).filter((order) => order.status === "accepted");

  const closeModal = useCallback(() => {
    setSignatureModalId(null);
    setSignatureData({ mode: "type", value: "" });
    setSignatureError(null);
  }, []);

  const resetSignature = useCallback(() => {
    setSignatureData((prev) => ({ ...prev, value: "" }));
    setSignatureError(null);
  }, []);

  const handleApprove = useCallback(
    async (id: string) => {
      if (!invoiceId) {
        setError("Invoice not found for this proposal. Please contact the business.");
        return;
      }

      if (!signatureData.value.trim()) {
        setSignatureError(
          signatureData.mode === "type"
            ? "Enter your name to sign and approve this change order."
            : "Please draw your signature to approve this change order."
        );
        return;
      }

      try {
        setAcceptingId(id);
        setError(null);
        setSignatureError(null);

        // For typed signatures, use the value as signer_name. For drawn, we still need a name.
        const signerName = signatureData.mode === "type" ? signatureData.value.trim() : (customerName ?? "Customer");

        const saved = await acceptChangeOrder(id, {
          invoice_id: invoiceId,
          signer_name: signerName,
          signer_email: customerEmail ?? undefined,
          signature_text: signatureData.value.trim(),
          signature_type: signatureData.mode,
        });
        setChangeOrdersState((current) => {
          const existingIds = new Set(current.map((o) => o.id));
          if (!existingIds.has(saved.id)) {
            return [...current, saved];
          }
          return current.map((order) => (order.id === saved.id ? saved : order));
        });
        closeModal();
      } catch (err) {
        setError(err instanceof Error ? err.message : "We couldn't approve this change order.");
      } finally {
        setAcceptingId(null);
      }
    },
    [customerEmail, customerName, invoiceId, signatureData, closeModal]
  );

  if ((!pending || pending.length === 0) && (!accepted || accepted.length === 0)) {
    return null;
  }

  const isDrawnSignature = (order: ChangeOrder) =>
    order.signature_type === "draw" && order.signature_text?.startsWith("data:image");

  return (
    <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      {pending.length > 0 ? (
        <>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Pending Change Orders</p>
              <p className="text-sm text-amber-800">Review and approve the updates below.</p>
            </div>
            {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          </div>
        <div className="mt-4 space-y-4">
          {pending.map((order) => (
            <div key={order.id} className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Change Order</span>
                  <span className="text-sm font-semibold text-slate-900">#{order.change_order_number}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {readOnly ? (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pending Approval</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureModalId(order.id);
                        setSignatureData({ mode: "type", value: "" });
                        setSignatureError(null);
                      }}
                      disabled={acceptingId === order.id || !invoiceId}
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {acceptingId === order.id ? "Approving..." : "Approve Change Order"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[12px] font-semibold text-slate-600">
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {order.items.map((item) => (
                      <tr key={item.id} className="text-[13px] text-slate-800">
                        <td className="px-3 py-2">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {item.description ? (
                            <p className="mt-1 whitespace-pre-line text-[12px] text-slate-600">{item.description}</p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        </>
      ) : null}

      {accepted.length > 0 ? (
        <div className="mt-6 space-y-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Accepted Change Orders</p>
              <p className="text-sm text-emerald-800">These updates are now locked.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
              Locked
            </span>
          </div>
          {accepted.map((order) => (
            <div key={order.id} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Change Order</span>
                  <span className="text-sm font-semibold text-slate-900">#{order.change_order_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  {order.signer_name ? (
                    <span className="text-[12px] font-medium text-slate-700">Signed by {order.signer_name}</span>
                  ) : null}
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">Accepted</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[12px] font-semibold text-slate-600">
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {order.items.map((item) => (
                      <tr key={item.id} className="text-[13px] text-slate-800">
                        <td className="px-3 py-2">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {item.description ? (
                            <p className="mt-1 whitespace-pre-line text-[12px] text-slate-600">{item.description}</p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {order.signature_text ? (
                <div className="mt-2">
                  {isDrawnSignature(order) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-slate-700">Signature:</span>
                      <img
                        src={order.signature_text}
                        alt="Customer signature"
                        className="h-10 w-auto max-w-[200px] object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-[12px] font-medium text-slate-700">
                      Signed by {order.signer_name ?? "Customer"}: "{order.signature_text}"
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <Modal
        open={signatureModalId !== null}
        onClose={closeModal}
        ariaLabel="Approve Change Order"
        size="lg"
        align="top"
      >
        <ModalHeader title="Approve Change Order" onClose={closeModal}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            #{pending.concat(accepted).find((o) => o.id === signatureModalId)?.change_order_number ?? ""}
          </p>
        </ModalHeader>

        <ModalBody className="space-y-4 text-[13px]">
          <p className="text-sm text-slate-600">
            Please sign below to approve this change order.
          </p>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Approval Signature
            </label>
            <SignaturePad
              value={signatureData}
              onChange={setSignatureData}
              disabled={acceptingId === signatureModalId}
              placeholder={customerName ? `${customerName} (type full name)` : "Type your full name"}
            />
            <p className="text-[11px] text-slate-500">
              By signing and confirming, you acknowledge this digital signature holds the same legal weight as a handwritten signature.
            </p>
            {signatureError ? (
              <p className="text-[12px] font-semibold text-rose-600">{signatureError}</p>
            ) : null}
          </div>
        </ModalBody>

        <ModalFooter className="flex-wrap gap-2">
          <button
            type="button"
            onClick={resetSignature}
            disabled={acceptingId === signatureModalId}
            className="rounded-md border border-slate-300 px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={closeModal}
            disabled={acceptingId === signatureModalId}
            className="rounded-md border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-500 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => signatureModalId && void handleApprove(signatureModalId)}
            disabled={acceptingId === signatureModalId || signatureData.value.trim() === ""}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {acceptingId === signatureModalId ? "Submitting..." : "Confirm Signature"}
          </button>
        </ModalFooter>
      </Modal>
    </section>
  );
}
