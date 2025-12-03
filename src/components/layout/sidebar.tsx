'use client';

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCompanyContext } from "@/contexts/AuthContext";
import { SidebarNav } from "./sidebar-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  organizationSwitcher?: React.ReactNode;
}

export function Sidebar({ isOpen, onClose, organizationSwitcher }: SidebarProps) {
  const { member } = useCompanyContext();

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const memberRole = member?.role ?? "admin";
  const canManageCompany = memberRole === "admin";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:w-56 lg:transform-none lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:sticky lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)] lg:flex-col lg:gap-4 lg:overflow-y-auto lg:border-r lg:border-slate-200
        `}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 lg:hidden">
          <p className="text-sm font-semibold text-slate-900">Menu</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-4 lg:p-3">
          {/* Organization Switcher */}
          {organizationSwitcher}

          {/* Company Settings Link */}
          {canManageCompany ? (
            <Link
              to="/company/settings"
              onClick={onClose}
              className="w-full rounded-full border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-px hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 lg:py-1.5 lg:text-[11px]"
            >
              Company Settings
            </Link>
          ) : null}

          <SidebarNav role={memberRole} onNavigate={onClose} />

          <div className="mt-auto pt-4 border-t border-slate-200">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 active:bg-slate-200 lg:hidden"
      aria-label="Open menu"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
