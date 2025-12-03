import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/layout/site-header";
import { Sidebar, MobileMenuButton } from "@/components/layout/sidebar";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { OrganizationSwitcher } from "@/components/layout/organization-switcher";
import { DashboardLayoutSkeleton } from "@/components/ui/skeleton";
import { useSessionContext, useCompanyContext, useOrganizationsContext } from "@/contexts/AuthContext";
import { PageHeaderProvider, usePageHeader } from "@/contexts/PageHeaderContext";

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useSessionContext();
  const { company } = useCompanyContext();
  const { organizations } = useOrganizationsContext();
  const { title, actions } = usePageHeader();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  const mobileMenuButton = (
    <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
  );

  return (
    <DashboardLayoutClient
      header={<SiteHeader mobileMenuButton={mobileMenuButton} title={title} actions={actions} />}
      sidebar={
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          organizationSwitcher={organizationSwitcher}
        />
      }
    >
      <Outlet />
    </DashboardLayoutClient>
  );
}

export default function DashboardLayout() {
  return (
    <PageHeaderProvider>
      <DashboardLayoutInner />
    </PageHeaderProvider>
  );
}
