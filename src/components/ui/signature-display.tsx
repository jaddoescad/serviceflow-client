"use client";

type SignatureDisplayProps = {
  signature: string;
  signatureType?: "type" | "draw";
  signedAt?: string | null;
  dateFormatter?: (date: string) => string;
  className?: string;
};

const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(value: string): string {
  return DEFAULT_DATE_FORMATTER.format(new Date(value));
}

export function SignatureDisplay({
  signature,
  signatureType = "type",
  signedAt,
  dateFormatter = formatDate,
  className = "",
}: SignatureDisplayProps) {
  const isDrawnSignature = signatureType === "draw" && signature.startsWith("data:image");

  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Customer Signature
      </p>
      {isDrawnSignature ? (
        <div className="mt-2">
          <img
            src={signature}
            alt="Customer signature"
            className="h-16 w-auto max-w-full object-contain"
          />
        </div>
      ) : (
        <p className="text-base font-semibold text-slate-900">{signature}</p>
      )}
      <p className="mt-1 text-[11px] text-slate-500">
        Signed {signedAt ? dateFormatter(signedAt) : "recently"}
      </p>
    </div>
  );
}
