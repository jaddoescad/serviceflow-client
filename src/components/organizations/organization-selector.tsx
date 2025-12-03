"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { switchCurrentOrganization, type UserOrganization } from "@/features/companies";
import { OrganizationCreationForm } from "./organization-creation-form";
import { JoinOrganizationForm } from "./join-organization-form";

interface OrganizationSelectorProps {
  userId: string;
  organizations: UserOrganization[];
  currentCompanyId: string | null;
  userEmail: string | null;
}

export function OrganizationSelector({
  userId,
  organizations,
  currentCompanyId,
  userEmail,
}: OrganizationSelectorProps) {
  const navigate = useNavigate();
  const [isSelecting, setIsSelecting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleSelectOrganization = async (companyId: string) => {
    setIsSelecting(true);

    try {
      await switchCurrentOrganization(userId, companyId);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Failed to select organization:", error);
      setIsSelecting(false);
    }
  };

  const handleBack = () => {
    setShowCreateForm(false);
    setShowJoinForm(false);
  };

  if (showCreateForm) {
    return (
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-blue-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        <OrganizationCreationForm userId={userId} userEmail={userEmail} />
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-blue-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        <JoinOrganizationForm userId={userId} userEmail={userEmail} />
      </div>
    );
  }

  // Show organization list if user has organizations
  if (organizations.length > 0) {
    return (
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Select Organization</h1>
          <p className="text-sm text-slate-600">
            Choose an organization to continue or create a new one
          </p>
        </div>

        <div className="space-y-3">
          {organizations.map((org) => {
            const companyName = org.companyName?.trim() || "Unknown organization";
            const companyInitial = companyName.charAt(0).toUpperCase();
            const role = org.role ?? "member";

            return (
              <button
                key={org.companyId}
                onClick={() => handleSelectOrganization(org.companyId)}
                disabled={isSelecting}
                className={`group flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition ${org.companyId === currentCompanyId
                  ? "border-accent bg-blue-50"
                  : "border-slate-200 hover:border-accent hover:bg-slate-50"
                  } disabled:opacity-60`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-600 text-lg font-bold text-white">
                  {companyInitial}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{companyName}</h3>
                  <p className="text-sm text-slate-500 capitalize">{role}</p>
                </div>
                {org.companyId === currentCompanyId && (
                  <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Current
                  </div>
                )}
                <svg
                  className="h-5 w-5 text-slate-400 transition group-hover:text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isSelecting}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-600 transition hover:border-accent hover:bg-slate-50 hover:text-accent disabled:opacity-60"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New
          </button>
          <button
            onClick={() => setShowJoinForm(true)}
            disabled={isSelecting}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-600 transition hover:border-accent hover:bg-slate-50 hover:text-accent disabled:opacity-60"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Join Existing
          </button>
        </div>
      </div>
    );
  }

  // Show two options for new users (no organizations yet)
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome to ServiceFlow</h1>
        <p className="mt-2 text-sm text-slate-600">
          Get started by creating a new organization or joining an existing one
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Create Organization Card */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="group flex flex-col items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm transition hover:border-accent hover:shadow-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-600 text-white transition group-hover:scale-110">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">Create Organization</h3>
            <p className="mt-1 text-sm text-slate-600">
              Start fresh with your own organization
            </p>
          </div>
        </button>

        {/* Join Organization Card */}
        <button
          onClick={() => setShowJoinForm(true)}
          className="group flex flex-col items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm transition hover:border-accent hover:shadow-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white transition group-hover:scale-110">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">Join Organization</h3>
            <p className="mt-1 text-sm text-slate-600">
              Use an invite code to join a team
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
