import type { PanelHeaderProps } from "../types";

export function PanelHeader({
  pipelineId,
  stageLabel,
  onClose,
  padding,
}: PanelHeaderProps) {
  return (
    <header className={`flex items-start justify-between border-b border-slate-200 ${padding}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          {pipelineId === "sales" ? "Sales stage" : "Pipeline stage"}
        </p>
        <h2 className="text-lg font-semibold text-slate-900">{stageLabel} drips</h2>
        <p className="mt-1 text-[12px] text-slate-600">
          Configure automated emails and texts that run whenever a deal enters this column.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close drip settings"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
      >
        ×
      </button>
    </header>
  );
}
