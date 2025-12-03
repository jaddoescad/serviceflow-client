"use client";

type TemplateParametersProps = {
  tokens: string[];
  description?: string;
  className?: string;
};

export function TemplateParameters({ tokens, description, className }: TemplateParametersProps) {
  if (!tokens.length) return null;

  return (
    <div className={className ?? ""}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Parameters
      </p>
      {description ? (
        <p className="mt-0.5 text-[11px] text-slate-600">{description}</p>
      ) : null}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tokens.map((token) => (
          <span
            key={token}
            className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700"
          >
            {token}
          </span>
        ))}
      </div>
    </div>
  );
}
