"use client";

import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type BackToPipelineButtonProps = {
  className?: string;
};

export function BackToPipelineButton({ className }: BackToPipelineButtonProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    navigate("/");
  };

  const overlay = useMemo(() => {
    if (!isLoading || !hasMounted) {
      return null;
    }

    return createPortal(
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950/30 backdrop-blur-sm">
        <svg className="h-8 w-8 animate-spin text-white" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" />
        </svg>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-white">Returning to pipeline…</p>
      </div>,
      document.body
    );
  }, [hasMounted, isLoading]);

  return (
    <>
      {overlay}
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 ${
          className ?? ""
        }`}
        disabled={isLoading}
      >
        ← Back to Pipeline
      </button>
    </>
  );
}
