'use client';

import { Link } from "react-router-dom";
import { useCompanyContext } from "@/contexts/AuthContext";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  const { company, member } = useCompanyContext();

  const companyName = company?.short_name?.trim() || company?.name?.trim() || "Your Company";
  const memberRole = member?.role ?? "admin";
  const canManageCompany = memberRole === "admin";

  return (
    <aside
      className="w-full border-b border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)] lg:w-56 lg:flex-col lg:gap-4 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:shadow-none"
      aria-label="Sidebar navigation"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          aria-hidden
          className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-purple-600 shadow-[0_10px_20px_rgba(37,99,235,0.18)]"
        />
        <p className="text-sm font-semibold text-slate-900">{companyName}</p>
        {canManageCompany ? (
          <Link
            to="/company/settings"
            className="w-full rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Company Settings
          </Link>
        ) : null}
      </div>

      <SidebarNav role={memberRole} />
    </aside>
  );
}
