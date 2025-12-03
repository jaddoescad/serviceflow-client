import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { listUserOrganizations } from "@/features/companies";
import { OrganizationSelector } from "@/components/organizations/organization-selector";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { OrganizationSelectSkeleton } from "@/components/ui/skeleton";
import type { User } from "@supabase/supabase-js";
import type { UserOrganization } from "@/features/companies";

const organizationSelectKeys = {
  all: ["organizationSelect"] as const,
  pageData: (userId: string) => [...organizationSelectKeys.all, "pageData", userId] as const,
};

type OrganizationPageData = {
  user: User;
  organizations: UserOrganization[];
  currentCompanyId: string | null;
  shouldRedirectHome: boolean;
};

export default function SelectOrganizationPage() {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();

  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: organizationSelectKeys.all,
    queryFn: async (): Promise<OrganizationPageData | null> => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const organizations = await listUserOrganizations(user.id);

      const { data: userData } = await supabase
        .from("users")
        .select("current_company_id")
        .eq("id", user.id)
        .maybeSingle();

      const currentCompanyId = userData?.current_company_id || null;
      const hasValidCurrentOrg = currentCompanyId
        ? organizations.some((org) => org.companyId === currentCompanyId)
        : false;

      return {
        user,
        organizations,
        currentCompanyId,
        shouldRedirectHome: hasValidCurrentOrg,
      };
    },
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (isError || pageData === null) {
      navigate("/login");
    } else if (pageData?.shouldRedirectHome) {
      navigate("/");
    }
  }, [isError, pageData, navigate]);

  if (isLoading) {
    return <OrganizationSelectSkeleton />;
  }

  if (!pageData || pageData.shouldRedirectHome) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      {/* Header with Logo and Logout */}
      <div className="absolute left-0 right-0 top-0 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
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
          <SignOutButton />
        </div>
      </div>

      {/* Main Content */}
      <OrganizationSelector
        userId={pageData.user.id}
        organizations={pageData.organizations}
        currentCompanyId={pageData.currentCompanyId}
        userEmail={pageData.user.email ?? null}
      />
    </div>
  );
}
