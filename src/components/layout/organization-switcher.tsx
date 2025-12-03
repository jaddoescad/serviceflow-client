"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { switchCurrentOrganization, type UserOrganization } from "@/features/companies";

interface OrganizationSwitcherProps {
  userId: string;
  organizations: UserOrganization[];
  currentOrganizationId: string | null;
}

export function OrganizationSwitcher({
  userId,
  organizations,
  currentOrganizationId,
}: OrganizationSwitcherProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOrg = organizations.find((org) => org.companyId === currentOrganizationId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitch = async (companyId: string) => {
    if (companyId === currentOrganizationId || isSwitching) {
      return;
    }

    setIsSwitching(true);
    setIsOpen(false);

    try {
      await switchCurrentOrganization(userId, companyId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch organization:", error);
      setIsSwitching(false);
    }
  };

  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex w-full items-center gap-3 rounded-lg bg-slate-100 px-3 py-3 transition hover:bg-slate-200 disabled:opacity-60"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-600 text-sm font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
          {currentOrg?.companyName?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex flex-1 flex-col text-left">
          <p className="text-sm font-semibold text-slate-900">{currentOrg?.companyName || "Unknown"}</p>
          <p className="text-xs font-medium text-slate-500 capitalize">{currentOrg?.role || ""}</p>
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2">
            {organizations.length > 1 && (
              <>
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Switch Organization
                </p>
                <div className="space-y-1">
                  {organizations.map((org) => (
                    <button
                      key={org.companyId}
                      onClick={() => handleSwitch(org.companyId)}
                      disabled={isSwitching || org.companyId === currentOrganizationId}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition ${org.companyId === currentOrganizationId
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-100 text-slate-900"
                        } disabled:opacity-60`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-accent to-purple-600 text-xs font-bold text-white">
                        {org.companyName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-xs font-semibold">{org.companyName}</p>
                        <p className="text-[10px] font-medium text-slate-500 capitalize">{org.role}</p>
                      </div>
                      {org.companyId === currentOrganizationId && (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="my-2 border-t border-slate-200" />
              </>
            )}
            <a
              href="/organizations/select"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create new organization
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
