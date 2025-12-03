"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkOrderDeliveryMethod } from "@/types/work-order-delivery";

type QuoteWorkOrderMenuProps = {
  workOrderUrl: string | null;
  secretWorkOrderUrl: string | null;
  disabledReason?: string | null;
  onSendRequest: (options: { method: WorkOrderDeliveryMethod; variant: "standard" | "secret" }) => void;
};

type QuoteBuilderHeaderProps = {
  clientName: string;
  propertyAddress: string;
  statusClass: string;
  statusLabel: string;
  onBack: () => void;
  isNavigatingBack: boolean;
  workOrderUrl: string | null;
  secretWorkOrderUrl: string | null;
  customerViewUrl: string | null;
  invoiceUrl?: string | null;
  shareDisabledReason?: string | null;
  isArchived?: boolean;
  onRequestSend: (options: { method: WorkOrderDeliveryMethod; variant: "standard" | "secret" }) => void;
  quoteStatus?: string;
  onAcceptWithoutSignature?: () => void;
  isAcceptingWithoutSignature?: boolean;
  acceptWithoutSignatureError?: string | null;
};

type CustomerViewButtonProps = {
  url: string | null;
  disabledReason?: string | null;
};

export function QuoteBuilderHeader({
  clientName,
  propertyAddress,
  statusClass,
  statusLabel,
  onBack,
  isNavigatingBack,
  workOrderUrl,
  secretWorkOrderUrl,
  customerViewUrl,
  invoiceUrl = null,
  shareDisabledReason,
  isArchived = false,
  onRequestSend,
  quoteStatus,
  onAcceptWithoutSignature,
  isAcceptingWithoutSignature = false,
  acceptWithoutSignatureError,
}: QuoteBuilderHeaderProps) {
  const addressDisplay = propertyAddress.trim() !== "" ? propertyAddress : "No address set";
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  return (
    <header className="mb-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-wait disabled:opacity-70"
            disabled={isNavigatingBack}
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Deal
            {isNavigatingBack ? (
              <svg className="h-3 w-3 animate-spin text-slate-600" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" />
              </svg>
            ) : null}
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Quote for {clientName}</h1>
            <p className="mt-1 text-sm text-slate-600">{addressDisplay}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {quoteStatus !== "accepted" && !isArchived && onAcceptWithoutSignature && (
              <>
                <button
                  type="button"
                  onClick={() => setShowAcceptConfirm(true)}
                  disabled={isAcceptingWithoutSignature}
                  className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Accept this proposal without requiring a customer signature"
                >
                  <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isAcceptingWithoutSignature ? "Accepting..." : "Accept Without Signature"}
                </button>
                {showAcceptConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                      <h3 className="text-lg font-semibold text-slate-900">Accept Without Signature?</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Are you sure you want to accept this quote without requiring a customer signature?
                      </p>
                      <div className="mt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAcceptConfirm(false)}
                          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAcceptConfirm(false);
                            onAcceptWithoutSignature();
                          }}
                          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Yes, Accept
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <CustomerViewButton url={customerViewUrl} disabledReason={shareDisabledReason} />
            {invoiceUrl ? <InvoiceButton url={invoiceUrl} /> : null}
            <QuoteWorkOrderMenu
              workOrderUrl={workOrderUrl}
              secretWorkOrderUrl={secretWorkOrderUrl}
              disabledReason={shareDisabledReason}
              onSendRequest={onRequestSend}
            />
          </div>
          {acceptWithoutSignatureError && (
            <p className="text-[11px] text-rose-600">{acceptWithoutSignatureError}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
              {statusLabel}
            </span>
            {isArchived && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <svg className="h-3 w-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="5" x="2" y="3" rx="1" />
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                  <path d="M10 12h4" />
                </svg>
                Archived
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function CustomerViewButton({ url, disabledReason }: CustomerViewButtonProps) {
  const enabled = Boolean(url);

  return (
    <button
      type="button"
      onClick={() => {
        if (enabled && url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }}
      disabled={!enabled}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      title={
        enabled
          ? "Open the customer-facing proposal"
          : disabledReason ?? "Save the quote to preview the customer view."
      }
    >
      <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Customer View
    </button>
  );
}

function InvoiceButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-100"
      target="_blank"
      rel="noreferrer"
    >
      <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
      View Invoice
    </a>
  );
}

function QuoteWorkOrderMenu({
  workOrderUrl,
  secretWorkOrderUrl,
  disabledReason,
  onSendRequest,
}: QuoteWorkOrderMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<null | "standard" | "secret">(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  const hasStandardLink = Boolean(workOrderUrl);
  const hasSecretLink = Boolean(secretWorkOrderUrl);
  const buttonDisabled = !hasStandardLink;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleClickAway = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [open]);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStandardLink) {
      setOpen(false);
    }
  }, [hasStandardLink]);

  const handleCopy = useCallback((url: string | null, variant: "standard" | "secret") => {
    if (!url) {
      return;
    }

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(variant);
        if (resetTimeoutRef.current) {
          window.clearTimeout(resetTimeoutRef.current);
        }
        resetTimeoutRef.current = window.setTimeout(() => {
          setCopied(null);
          resetTimeoutRef.current = null;
        }, 1500);
      })
      .catch((error) => {
        console.error("Failed to copy work order link", error);
      });
  }, []);

  const handleSendEmail = useCallback(
    (secret: boolean) => {
      if (secret && !hasSecretLink) {
        return;
      }
      if (!secret && !hasStandardLink) {
        return;
      }

      onSendRequest({ method: "email", variant: secret ? "secret" : "standard" });
      setOpen(false);
    },
    [hasSecretLink, hasStandardLink, onSendRequest]
  );

  const handleSendSms = useCallback(
    (secret: boolean) => {
      if (secret && !hasSecretLink) {
        return;
      }
      if (!secret && !hasStandardLink) {
        return;
      }

      onSendRequest({ method: "text", variant: secret ? "secret" : "standard" });
      setOpen(false);
    },
    [hasSecretLink, hasStandardLink, onSendRequest]
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={buttonDisabled}
        onClick={() => {
          if (!buttonDisabled) {
            setOpen((previous) => !previous);
          }
        }}
        className="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={open}
        title={buttonDisabled ? disabledReason ?? "Save the quote to share a work order." : undefined}
      >
        <svg className="h-3 w-3 text-slate-500" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10h14M10 3l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Work Order
        <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-lg border border-slate-200 bg-white py-2 text-[12px] shadow-lg">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Work Order Link
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Copy the link or send it directly to your crew.
            </p>
          </div>
          <div className="border-t border-slate-100" />
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            onClick={() => handleCopy(workOrderUrl, "standard")}
          >
            <span>Copy Work Order Link</span>
            {copied === "standard" ? (
              <span className="text-[11px] font-medium text-emerald-600">Copied</span>
            ) : null}
          </button>
          {hasSecretLink ? (
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
              onClick={() => handleCopy(secretWorkOrderUrl, "secret")}
            >
              <span>Copy Secret Link</span>
              {copied === "secret" ? (
                <span className="text-[11px] font-medium text-emerald-600">Copied</span>
              ) : null}
            </button>
          ) : null}
          <div className="border-t border-slate-100" />
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            onClick={() => handleSendEmail(false)}
          >
            <span>Send via Email</span>
          </button>
          {hasSecretLink ? (
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
              onClick={() => handleSendEmail(true)}
            >
              <span>Send Secret via Email</span>
            </button>
          ) : null}
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            onClick={() => handleSendSms(false)}
          >
            <span>Send via SMS</span>
          </button>
          {hasSecretLink ? (
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
              onClick={() => handleSendSms(true)}
            >
              <span>Send Secret via SMS</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
