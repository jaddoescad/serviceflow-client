"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/library";

interface JoinOrganizationFormProps {
  userId: string;
  userEmail: string | null;
}

export function JoinOrganizationForm({ userEmail }: JoinOrganizationFormProps) {
  const navigate = useNavigate();

  const copyEmail = () => {
    if (userEmail) {
      navigator.clipboard.writeText(userEmail);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-card">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Join Organization</h2>
          <p className="text-sm text-slate-600">
            To join an existing organization, follow these steps:
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Share your email</h3>
              <p className="mt-1 text-sm text-slate-600">
                Give this email address to your organization admin:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-900">
                  {userEmail || "No email available"}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyEmail}
                  disabled={!userEmail}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Wait for admin to add you</h3>
              <p className="mt-1 text-sm text-slate-600">
                The organization admin will add you as a member from their team settings.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Refresh this page</h3>
              <p className="mt-1 text-sm text-slate-600">
                Once added, refresh this page and you&apos;ll see the organization appear.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Need to create your own organization instead?
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Go back and choose &quot;Create Organization&quot; to start your own team.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={handleRefresh} fullWidth>
            Refresh Page
          </Button>
          <Button variant="secondary" onClick={() => navigate("/organizations/select")} fullWidth>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
