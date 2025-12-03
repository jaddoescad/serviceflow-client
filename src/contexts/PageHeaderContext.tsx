"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type PageHeaderContextValue = {
  title: string;
  actions: ReactNode | null;
  setPageHeader: (title: string, actions?: ReactNode) => void;
  clearPageHeader: () => void;
};

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("ServiceFlow");
  const [actions, setActions] = useState<ReactNode | null>(null);

  const setPageHeader = useCallback((newTitle: string, newActions?: ReactNode) => {
    setTitle(newTitle);
    setActions(newActions ?? null);
  }, []);

  const clearPageHeader = useCallback(() => {
    setTitle("ServiceFlow");
    setActions(null);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ title, actions, setPageHeader, clearPageHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  }
  return context;
}
