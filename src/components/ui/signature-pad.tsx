"use client";

import { useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export type SignatureMode = "type" | "draw";

export type SignatureData = {
  mode: SignatureMode;
  value: string; // For "type" mode: the typed name, for "draw" mode: base64 image data
};

type SignaturePadProps = {
  value: SignatureData;
  onChange: (data: SignatureData) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function SignaturePad({
  value,
  onChange,
  disabled = false,
  placeholder = "Type your full name",
}: SignaturePadProps) {
  const [mode, setMode] = useState<SignatureMode>(value.mode);
  const [hasDrawn, setHasDrawn] = useState(false);
  const signatureRef = useRef<SignatureCanvas | null>(null);

  const handleModeChange = useCallback(
    (newMode: SignatureMode) => {
      setMode(newMode);
      setHasDrawn(false);
      onChange({ mode: newMode, value: "" });
      if (newMode === "draw" && signatureRef.current) {
        signatureRef.current.clear();
      }
    },
    [onChange]
  );

  const handleTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ mode: "type", value: event.target.value });
    },
    [onChange]
  );

  const handleDrawEnd = useCallback(() => {
    if (signatureRef.current) {
      setHasDrawn(true);
      const dataUrl = signatureRef.current.toDataURL("image/png");
      onChange({ mode: "draw", value: dataUrl });
    }
  }, [onChange]);

  const handleClear = useCallback(() => {
    if (mode === "draw" && signatureRef.current) {
      signatureRef.current.clear();
    }
    setHasDrawn(false);
    onChange({ mode, value: "" });
  }, [mode, onChange]);

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => handleModeChange("type")}
          disabled={disabled}
          className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
            mode === "type"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Type Name
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("draw")}
          disabled={disabled}
          className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
            mode === "draw"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Draw Signature
        </button>
      </div>

      {/* Signature Input Area */}
      {mode === "type" ? (
        <input
          type="text"
          value={value.value}
          onChange={handleTypeChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      ) : (
        <div className="relative">
          <div
            className={`rounded-md border-2 border-dashed bg-white ${
              disabled ? "border-slate-200 bg-slate-50" : "border-slate-300"
            }`}
          >
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              canvasProps={{
                className: "w-full h-32 rounded-md",
                style: {
                  width: "100%",
                  height: "128px",
                  touchAction: "none",
                },
              }}
              onEnd={handleDrawEnd}
            />
            {/* Signature line indicator */}
            <div className="pointer-events-none absolute bottom-8 left-4 right-4 border-b border-slate-300" />
            {/* Placeholder text - hide when has drawn */}
            {!hasDrawn && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-[12px] text-slate-400">
                  Sign here with your finger or mouse
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || (mode === "type" ? value.value === "" : !hasDrawn)}
          className="text-[11px] font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear {mode === "type" ? "Name" : "Signature"}
        </button>
      </div>
    </div>
  );
}
