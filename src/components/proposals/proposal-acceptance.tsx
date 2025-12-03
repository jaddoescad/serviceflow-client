"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/shared/modal";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT } from "@/constants/proposal-terms";
import { API_BASE_URL } from "@/services/api";
import { SignaturePad, type SignatureData } from "@/components/ui/signature-pad";

export type ProposalAcceptanceResult = {
  signature: string;
  signedAt: string;
};

type ProposalAcceptanceProps = {
  shareId: string;
  initialStatus: "draft" | "sent" | "accepted" | "declined";
  onAccepted?: (result: ProposalAcceptanceResult) => void;
  variant?: "card" | "inline";
  className?: string;
  termsText?: string;
};

function mergeClassNames(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export function ProposalAcceptance({
  shareId,
  initialStatus,
  variant = "card",
  className,
  termsText,
  onAccepted,
}: ProposalAcceptanceProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState<SignatureData>({ mode: "type", value: "" });
  const [modalError, setModalError] = useState<string | null>(null);

  const templateText = useMemo(
    () => termsText ?? DEFAULT_PROPOSAL_TERMS_TEMPLATE_CONTENT,
    [termsText]
  );

  const navigate = useNavigate();

  const handleAccept = useCallback(async () => {
    if (isSubmitting || status === "accepted") {
      return;
    }

    setModalError(null);
    setSignatureData({ mode: "type", value: "" });
    setModalOpen(true);
  }, [isSubmitting, shareId, status]);

  const closeModal = useCallback(() => {
    setModalError(null);
    setModalOpen(false);
    setSignatureData({ mode: "type", value: "" });
  }, []);

  const resetSignature = useCallback(() => {
    setSignatureData((prev) => ({ ...prev, value: "" }));
    setModalError(null);
  }, []);

  const confirmSignature = useCallback(async () => {
    if (isSubmitting || status === "accepted") {
      return;
    }

    if (!signatureData.value.trim()) {
      setModalError(
        signatureData.mode === "type"
          ? "Enter your name to confirm this proposal."
          : "Please draw your signature to confirm this proposal."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setModalError(null);

    // For typed signatures, send the name. For drawn signatures, send the base64 image.
    const signaturePayload = {
      signature: signatureData.value.trim(),
      signatureType: signatureData.mode,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/quotes/share/${shareId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signaturePayload),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        const message =
          payload.error ?? "We couldn't accept this proposal. Please try again.";
        setError(message);
        setModalError(message);
        setIsSubmitting(false);
        return;
      }

      const payload = await response
        .json()
        .catch(() => ({ status: "accepted" } satisfies { status: string }));

      setStatus("accepted");
      setModalOpen(false);
      window.location.reload();

      if (
        payload &&
        typeof payload.signature === "string" &&
        typeof payload.signedAt === "string"
      ) {
        onAccepted?.({
          signature: payload.signature,
          signedAt: payload.signedAt,
        });
      }
    } catch (error) {
      console.error("Failed to accept proposal", error);
      setError("We couldn't accept this proposal. Please try again.");
      setModalError("We couldn't accept this proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, shareId, status, signatureData, onAccepted]);

  const dialog = modalOpen ? (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      ariaLabel="Approve Proposal"
      size="lg"
      align="top"
    >
      <ModalHeader
        title="Approve Proposal"
        onClose={closeModal}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Terms & Conditions
        </p>
      </ModalHeader>

      <ModalBody className="space-y-4 text-[13px]">
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 leading-relaxed text-slate-600">
          <p className="whitespace-pre-line">{templateText}</p>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Approval Signature
          </label>
          <SignaturePad
            value={signatureData}
            onChange={setSignatureData}
            disabled={isSubmitting}
            placeholder="Type your full name"
          />
          <p className="text-[11px] text-slate-500">
            By signing and confirming, you acknowledge this digital signature holds the same legal weight as a handwritten signature.
          </p>
          {modalError ? (
            <p className="text-[12px] font-semibold text-rose-600">{modalError}</p>
          ) : null}
        </div>
      </ModalBody>

      <ModalFooter className="flex-wrap gap-2">
        <button
          type="button"
          onClick={resetSignature}
          disabled={isSubmitting}
          className="rounded-md border border-slate-300 px-4 py-2 text-[12px] font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={closeModal}
          disabled={isSubmitting}
          className="rounded-md border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-500 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmSignature}
          disabled={isSubmitting || signatureData.value.trim() === ""}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Confirm Signature"}
        </button>
      </ModalFooter>
    </Modal>
  ) : null;

  let body: ReactNode;

  if (variant === "inline") {
    if (status === "accepted") {
      body = (
        <div className={mergeClassNames("flex flex-col gap-1", className)}>
          <span className="text-sm font-semibold text-emerald-600">Proposal accepted</span>
          <span className="text-[11px] text-slate-500">
            Thank you! We will reach out soon to schedule the next steps.
          </span>
        </div>
      );
    } else if (status === "declined") {
      body = (
        <div className={mergeClassNames("flex flex-col gap-1", className)}>
          <span className="text-sm font-semibold text-rose-600">This proposal was declined.</span>
        </div>
      );
    } else {
      body = (
        <div className={mergeClassNames("flex flex-col gap-2", className)}>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Approve Proposal"}
          </button>
          {error ? (
            <span className="text-[11px] text-rose-600">{error}</span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Approve this proposal to let us know you would like to proceed.
            </span>
          )}
        </div>
      );
    }
  } else {
    if (status === "accepted") {
      body = (
        <div
          className={mergeClassNames(
            "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700",
            className
          )}
        >
          <p className="font-semibold">Proposal accepted</p>
          <p className="mt-1 text-[13px]">Thank you! We will reach out soon to schedule the next steps.</p>
        </div>
      );
    } else if (status === "declined") {
      body = (
        <div
          className={mergeClassNames(
            "rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
            className
          )}
        >
          <p className="font-semibold">This proposal was declined.</p>
        </div>
      );
    } else {
      body = (
        <div
          className={mergeClassNames(
            "flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700",
            className
          )}
        >
          <div>
            <p className="font-semibold text-slate-900">Ready to move forward?</p>
            <p className="mt-1 text-[13px] text-slate-600">
              Approve this proposal to let us know you would like to proceed. We will confirm details and schedule your project.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAccept}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Approve Proposal"}
          </button>
          {error ? <p className="text-[12px] text-rose-600">{error}</p> : null}
        </div>
      );
    }
  }

  return (
    <>
      {body}
      {dialog}
    </>
  );
}
