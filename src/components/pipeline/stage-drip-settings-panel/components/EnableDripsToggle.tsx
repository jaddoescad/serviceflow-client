import type { EnableDripsToggleProps } from "../types";

export function EnableDripsToggle({
  enabled,
  isSaving,
  stageLabel,
  onToggle,
}: EnableDripsToggleProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Enable drips</p>
          <p className="text-[11px] text-slate-600">
            Turn this automation on to schedule drip messages when deals enter {stageLabel}.
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={enabled}
            onChange={(event) => onToggle(event.target.checked)}
            disabled={isSaving}
          />
          <div className="h-5 w-9 rounded-full bg-slate-300 peer-checked:bg-blue-600" />
          <div className="absolute left-1 top-[3px] h-3.5 w-3.5 rounded-full bg-white shadow peer-checked:translate-x-4" />
        </label>
      </div>
      {isSaving ? (
        <p className="mt-2 text-[11px] text-slate-500">Saving your settings…</p>
      ) : null}
    </section>
  );
}
