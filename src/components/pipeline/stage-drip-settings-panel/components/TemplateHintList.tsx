import { useState, useEffect, useRef } from "react";
import { DRIP_TEMPLATE_HINTS } from "../constants";

export function TemplateHintList() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (token: string) => {
    try {
      await navigator.clipboard?.writeText(token);
      setCopiedToken(token);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopiedToken(null), 1200);
    } catch (error) {
      console.error("Failed to copy token", error);
    }
  };

  return (
    <div className="mt-2 space-y-1.5 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-slate-700">Placeholders</p>
        <p className="text-[10px] text-slate-500">Click to copy</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DRIP_TEMPLATE_HINTS.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => handleCopy(token)}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-mono text-slate-800 shadow-sm transition hover:-translate-y-px hover:border-blue-500 hover:text-blue-700"
          >
            {copiedToken === token ? "Copied!" : token}
          </button>
        ))}
      </div>
    </div>
  );
}
