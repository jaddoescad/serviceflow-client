import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { BackToPipelineButton } from "@/components/layout/back-to-pipeline-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LoadingPage } from "@/components/ui/loading-spinner";

function DealDetailHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white" role="banner">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-4">
        <BackToPipelineButton />
        <nav aria-label="Primary" className="flex items-center gap-3 text-xs font-medium text-slate-900">
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}

export default function DealDetailLayout() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useSessionContext();
  const { company } = useCompanyContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated || !user || !company) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DealDetailHeader />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
