"use client";

import { createContext, useContext, useMemo } from "react";

type NavigationLoaderContextValue = {
  showLoader: () => void;
};

const NavigationLoaderContext = createContext<NavigationLoaderContextValue | null>(null);

export function useNavigationLoader(): NavigationLoaderContextValue {
  const context = useContext(NavigationLoaderContext);
  if (!context) {
    throw new Error("useNavigationLoader must be used within DashboardLayoutClient");
  }
  return context;
}

type DashboardLayoutClientProps = {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardLayoutClient({ header, sidebar, children }: DashboardLayoutClientProps) {
  // Keep the context for API compatibility, but no longer show overlay
  const contextValue = useMemo(() => ({ showLoader: () => {} }), []);

  return (
    <NavigationLoaderContext.Provider value={contextValue}>
      <div className="flex h-screen flex-col overflow-hidden">
        {header}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
          {sidebar}
          <main className="flex flex-1 min-h-0 flex-col overflow-hidden bg-slate-50 p-4 md:p-5" role="main">
            {children}
          </main>
        </div>
      </div>
    </NavigationLoaderContext.Provider>
  );
}
