import type { DealChecklistItem, DealDetailSnapshot } from "@/types/deal-details";

type DealChecklistCardProps = Pick<DealDetailSnapshot, "checklist">;

const getProgress = (items: DealChecklistItem[]) => {
  if (items.length === 0) return 0;
  const completed = items.filter((item) => item.completed).length;
  return Math.round((completed / items.length) * 100);
};

export function DealChecklistCard({ checklist }: DealChecklistCardProps) {
  const progress = getProgress(checklist);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Checklist</h3>
        <span className="text-[11px] text-slate-500">{progress}%</span>
      </header>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
      </div>
      <ul className="space-y-2">
        {checklist.map((item) => (
          <li key={item.id} className="flex items-start gap-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5">
            <input
              type="checkbox"
              defaultChecked={item.completed}
              className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-slate-900"
              disabled
            />
            <span className="text-[13px] text-slate-700">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
