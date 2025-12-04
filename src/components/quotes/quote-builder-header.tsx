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
  quoteNumber: string;
  createdAt: Date | null;
  statusClass: string;
  statusLabel: string;
  workOrderUrl: string | null;
  secretWorkOrderUrl: string | null;
  invoiceUrl?: string | null;
  shareDisabledReason?: string | null;
  isArchived?: boolean;
  onRequestSend: (options: { method: WorkOrderDeliveryMethod; variant: "standard" | "secret" }) => void;
};

const formatDateTime = (value: Date) =>
  value.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function QuoteBuilderHeader({
  clientName,
  quoteNumber,
  createdAt,
  statusClass,
  statusLabel,
  workOrderUrl,
  secretWorkOrderUrl,
  invoiceUrl = null,
  shareDisabledReason,
  isArchived = false,
  onRequestSend,
}: QuoteBuilderHeaderProps) {
  const createdAtLabel = createdAt ? formatDateTime(createdAt) : null;

  return (
    <header className="mb-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6">
      <div className="flex items-start justify-between gap-3">
        {/* Left side - Status and title */}
        <div className="flex min-w-0 flex-col gap-2">
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
          <div>
            <h1 className="truncate text-lg font-semibold text-slate-900">Quote for {clientName}</h1>
            <p className="text-xs text-slate-500">{quoteNumber}{createdAtLabel ? ` · ${createdAtLabel}` : ""}</p>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          {invoiceUrl ? <InvoiceButton url={invoiceUrl} /> : null}
          <QuoteWorkOrderMenu
            workOrderUrl={workOrderUrl}
            secretWorkOrderUrl={secretWorkOrderUrl}
            disabledReason={shareDisabledReason}
            onSendRequest={onRequestSend}
          />
        </div>
      </div>
    </header>
  );
}

function InvoiceButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-100 sm:justify-start sm:py-1.5"
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
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:justify-start sm:py-1.5"
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
