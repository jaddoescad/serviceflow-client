import { formatDripStepSummary } from "@/lib/drip-formatters";
import type { DripStepCardProps } from "../types";
import { StepControls } from "./StepControls";
import { DripStepForm } from "./DripStepForm";

export function DripStepCard({
  step,
  index,
  isFirst,
  isLast,
  variant,
  isExpanded,
  draft,
  onSave,
  onDelete,
  onMove,
  onToggleExpand,
  onStepChange,
}: DripStepCardProps) {
  const isSaving = draft?.isSaving ?? false;
  const error = draft?.error ?? null;
  const isInline = variant === "inline";

  const controls = (
    <StepControls
      isFirst={isFirst}
      isLast={isLast}
      isSaving={isSaving}
      onMoveUp={() => onMove(step.id, "up")}
      onMoveDown={() => onMove(step.id, "down")}
      onDelete={() => onDelete(step.id)}
    />
  );

  const formFields = (
    <DripStepForm
      step={step}
      isSaving={isSaving}
      error={error}
      onStepChange={(updates) => onStepChange(step.id, updates)}
      onSave={() => onSave(step)}
    />
  );

  if (isInline) {
    const showExpanded = isExpanded;
    return (
      <section className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-slate-900">Drip #{index + 1}</p>
            <p className="text-[11px] text-slate-600">{formatDripStepSummary(step)}</p>
          </div>
          <div className="flex items-center gap-1">
            {showExpanded ? controls : null}
            <button
              type="button"
              onClick={() => onToggleExpand(step.id)}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              {showExpanded ? "Done" : "Edit"}
            </button>
          </div>
        </div>
        {showExpanded ? <div className="mt-3 space-y-3">{formFields}</div> : null}
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Drip #{index + 1}</h3>
        {controls}
      </div>
      <div className="mt-3 space-y-3">{formFields}</div>
    </section>
  );
}
