type DetailsSectionProps = {
  dealTitle: string;
};

export function DetailsSection({ dealTitle }: DetailsSectionProps) {
  return (
    <section className="space-y-2">
      <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
        <span>Title</span>
        <input
          value={dealTitle}
          readOnly
          className="w-full cursor-default rounded border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-[12px] font-medium text-slate-700"
        />
      </label>
    </section>
  );
}
