"use client";

import { useMemo, useState } from "react";

const DRIP_OPTIONS = [
  { id: "paused", label: "Drips Paused" },
  { id: "lead-nurture", label: "Lead Nurture" },
  { id: "estimate-followup", label: "Estimate Follow-up" },
  { id: "post-job", label: "Post-Job Touch" },
];

type DealDripSelectorProps = {
  value?: string;
  className?: string;
  selectClassName?: string;
};

export function DealDripSelector({ value, className, selectClassName }: DealDripSelectorProps) {
  const options = useMemo(() => DRIP_OPTIONS, []);
  const initial = options.find((option) => option.label === value || option.id === value) ?? options[1];
  const [drip, setDrip] = useState(initial.id);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setDrip(next);
    const label = options.find((option) => option.id === next)?.label ?? next;
    setFeedback(`Drip mocked to "${label}"`);
  };

  const selectWidthClass = selectClassName ?? "w-fit";

  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <select
        aria-label="Deal drip series"
        value={drip}
        onChange={handleChange}
        className={`${selectWidthClass} rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200`.trim()}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-live="polite" className="sr-only">
        {feedback ?? ""}
      </span>
    </div>
  );
}
