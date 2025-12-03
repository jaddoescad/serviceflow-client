"use client";

import { useCallback, useState } from "react";
import { acceptChangeOrder } from "@/services/change-orders";
import { formatCurrency } from "@/lib/currency";
import { useEffect } from "react";

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
  const [signature, setSignature] = useState<string>("");
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [changeOrdersState, setChangeOrdersState] = useState<ChangeOrder[]>(changeOrders ?? []);

  useEffect(() => {
    setChangeOrdersState(changeOrders ?? []);
    setSignature("");
    setSignatureError(null);
  }, [changeOrders]);

  const pending = (changeOrdersState ?? []).filter((order) => order.status === "pending");
  const accepted = (changeOrdersState ?? []).filter((order) => order.status === "accepted");

  const handleApprove = useCallback(
    async (id: string) => {
      if (!invoiceId) {
        setError("Invoice not found for this proposal. Please contact the business.");
        return;
      }

      const trimmedSignature = signature.trim();
      if (!trimmedSignature) {
        setSignatureError("Enter your name to sign and approve this change order.");
        return;
      }

      try {
        setAcceptingId(id);
        setError(null);
        const saved = await acceptChangeOrder(id, {
          invoice_id: invoiceId,
          signer_name: trimmedSignature,
          signer_email: customerEmail ?? null,
          signature_text: trimmedSignature,
        });
        setChangeOrdersState((current) => {
          const existingIds = new Set(current.map((o) => o.id));
          if (!existingIds.has(saved.id)) {
            return [...current, saved];
          }
          return current.map((order) => (order.id === saved.id ? saved : order));
        });
        setSignature("");
        setSignatureModalId(null);
        setSignatureError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "We couldn't approve this change order.");
      } finally {
        setAcceptingId(null);
      }
    },
    [customerEmail, invoiceId, signature]
  );

  if ((!pending || pending.length === 0) && (!accepted || accepted.length === 0)) {
    return null;
  }

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
                        setSignature("");
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
                <p className="mt-2 text-[12px] font-medium text-slate-700">
                  Signed by {order.signer_name ?? "Customer"}: “{order.signature_text}”
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {signatureModalId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-3 py-6">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setSignatureModalId(null);
                setSignature("");
                setSignatureError(null);
              }}
              aria-label="Close approve dialog"
              className="absolute right-4 top-4 cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col gap-4 px-6 pb-6 pt-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Approve Change Order</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  #{(pending.concat(accepted).find((o) => o.id === signatureModalId)?.change_order_number) ?? ""}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Please type your name to sign and approve this change order.
                </p>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  Signature
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(event) => {
                    setSignature(event.target.value);
                    setSignatureError(null);
                  }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder={customerName ? `${customerName} (type full name)` : "Type your full name"}
                  disabled={acceptingId === signatureModalId}
                />
                {signatureError ? (
                  <p className="mt-2 text-sm font-medium text-rose-600">{signatureError}</p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignatureModalId(null);
                    setSignature("");
                    setSignatureError(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  disabled={acceptingId === signatureModalId}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleApprove(signatureModalId)}
                  disabled={acceptingId === signatureModalId}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acceptingId === signatureModalId ? "Approving..." : "Approve & Sign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
