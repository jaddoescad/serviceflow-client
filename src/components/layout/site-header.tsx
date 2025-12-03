"use client";

interface SiteHeaderProps {
  mobileMenuButton?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export function SiteHeader({ mobileMenuButton, title, actions }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white" role="banner">
      <div className="flex h-14 w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {mobileMenuButton}
          <p className="text-sm font-semibold text-slate-900">{title || "ServiceFlow"}</p>
        </div>
        {actions ? (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
