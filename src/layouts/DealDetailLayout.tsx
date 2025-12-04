import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { BackToPipelineButton } from "@/components/layout/back-to-pipeline-button";
import { LoadingPage } from "@/components/ui/loading-spinner";

// Context for header actions (like Customer View button)
type HeaderAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type BackAction = {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
};

type DealDetailHeaderContextValue = {
  headerAction: HeaderAction | null;
  setHeaderAction: (action: HeaderAction | null) => void;
  backAction: BackAction | null;
  setBackAction: (action: BackAction | null) => void;
};

const DealDetailHeaderContext = createContext<DealDetailHeaderContextValue | null>(null);

export function useDealDetailHeaderAction() {
  const context = useContext(DealDetailHeaderContext);
  if (!context) {
    throw new Error("useDealDetailHeaderAction must be used within DealDetailLayout");
  }
  return context;
}

function DealDetailHeader({ action, backAction }: { action: HeaderAction | null; backAction: BackAction | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white" role="banner">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-4">
        {backAction ? (
          <button
            type="button"
            onClick={backAction.onClick}
            disabled={backAction.isLoading}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-wait disabled:opacity-70"
          >
            ← {backAction.label}
            {backAction.isLoading && (
              <svg className="h-3 w-3 animate-spin text-slate-600" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" />
              </svg>
            )}
          </button>
        ) : (
          <BackToPipelineButton />
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {action.icon}
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}

export default function DealDetailLayout() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useSessionContext();
  const { company } = useCompanyContext();
  const [headerAction, setHeaderAction] = useState<HeaderAction | null>(null);
  const [backAction, setBackAction] = useState<BackAction | null>(null);

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
    <DealDetailHeaderContext.Provider value={{ headerAction, setHeaderAction, backAction, setBackAction }}>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <DealDetailHeader action={headerAction} backAction={backAction} />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </DealDetailHeaderContext.Provider>
  );
}
