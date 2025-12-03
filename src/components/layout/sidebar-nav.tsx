"use client";

import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import { useNavigationLoader } from "@/components/layout/dashboard-layout-client";
import type { CompanyMemberRole } from "@/types/company-members";

type NavItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

const dashboardItems: NavItem[] = [
  { label: "Sales Pipeline", href: "/" },
  { label: "Sales List", href: "/sales" },
  { label: "Appointments", href: "/appointments" },
  { label: "Jobs Pipeline", href: "/jobs" },
  { label: "Jobs List", href: "/jobs/list" },
  { label: "Jobs Schedule", href: "/jobs/calendar" },
];

const baseManagementItems: NavItem[] = [
  { label: "Proposals", href: "/proposals" },
  { label: "Drips", href: "/drips" },
  { label: "Crews", href: "/crews" },
  { label: "Contacts", href: "/contacts" },
  { label: "Invoices", href: "/invoices" },
  { label: "Products/Services", href: "/products" },
];

const linkBaseClasses =
  "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px]";

const disabledClasses = "text-slate-400 opacity-60 pointer-events-none";

const inactiveClasses = "text-slate-600 hover:bg-slate-100 active:bg-slate-200 lg:text-slate-500";

const activeClasses = "border border-blue-100 bg-blue-50 text-blue-600";

function renderItems(items: NavItem[], pathname: string, onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string, isActive: boolean) => void) {
  return items.map((item) => {
    const isActive = !item.disabled && pathname === item.href;

    if (item.disabled) {
      return (
        <li key={item.label}>
          <span className={`${linkBaseClasses} ${disabledClasses}`}>{item.label}</span>
        </li>
      );
    }

    return (
      <li key={item.label}>
        <Link
          to={item.href}
          className={`${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          onClick={(event) => onNavigate(event, item.href, isActive)}
        >
          {item.label}
        </Link>
      </li>
    );
  });
}

type SidebarNavProps = {
  role: CompanyMemberRole | "admin";
  onNavigate?: () => void;
};

export function SidebarNav({ role, onNavigate }: SidebarNavProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isHydrated, setIsHydrated] = useState(false);
  const { showLoader } = useNavigationLoader();
  const resolvedPathname = isHydrated && pathname ? pathname : "";

  // Delay using the pathname until after hydration to keep server/client markup in sync.
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const managementItems: NavItem[] = [
    ...baseManagementItems,
    {
      label: "Communication Templates",
      href: role === "admin" ? "/communication-templates" : "#",
      disabled: role !== "admin",
    },
    {
      label: "Users",
      href: role === "admin" ? "/users" : "#",
      disabled: role !== "admin",
    },
  ];

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string, isActive: boolean) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    if (isActive) {
      onNavigate?.();
      return;
    }

    showLoader();
    onNavigate?.();
  };

  return (
    <nav className="mt-4 flex flex-col gap-4 text-[11px] font-semibold text-slate-700">
      <div className="space-y-2.5">
        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500">Dashboard</p>
        <ul className="space-y-1.5">{renderItems(dashboardItems, resolvedPathname, handleNavigate)}</ul>
      </div>

      <div className="space-y-2.5">
        <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500">Management</p>
        <ul className="space-y-1.5">{renderItems(managementItems, resolvedPathname, handleNavigate)}</ul>
      </div>
    </nav>
  );
}
