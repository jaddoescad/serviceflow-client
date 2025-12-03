import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/layout/site-header";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { OrganizationSwitcher } from "@/components/layout/organization-switcher";
import { DashboardLayoutSkeleton } from "@/components/ui/skeleton";
import { useSessionContext, useCompanyContext, useOrganizationsContext } from "@/contexts/AuthContext";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useSessionContext();
  const { company } = useCompanyContext();
  const { organizations } = useOrganizationsContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const organizationSwitcher = (
    <OrganizationSwitcher
      userId={user.id}
      organizations={organizations}
      currentOrganizationId={company?.id ?? null}
    />
  );

  return (
    <DashboardLayoutClient
      header={<SiteHeader organizationSwitcher={organizationSwitcher} />}
      sidebar={<Sidebar />}
    >
      <Outlet />
    </DashboardLayoutClient>
  );
}
