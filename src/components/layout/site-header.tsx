"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";

interface SiteHeaderProps {
  organizationSwitcher?: React.ReactNode;
}

export function SiteHeader({ organizationSwitcher }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white" role="banner">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-purple-600 shadow-[0_8px_18px_rgba(37,99,235,0.25)]"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">ServiceFlow</p>
            <p className="text-xs font-medium text-slate-600">Multi-Org CRM</p>
          </div>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-3 text-xs font-medium text-slate-900">
          {organizationSwitcher}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
