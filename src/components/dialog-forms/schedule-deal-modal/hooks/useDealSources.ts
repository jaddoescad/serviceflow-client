import { useEffect, useState } from "react";
import { listDealSources } from "@/services/deal-sources";
import { DEFAULT_DEAL_SOURCES } from "@/features/deals";

type UseDealSourcesProps = {
  open: boolean;
  companyId: string;
  currentLeadSource: string | null | undefined;
};

export function useDealSources({ open, companyId, currentLeadSource }: UseDealSourcesProps) {
  const [dealSources, setDealSources] = useState<string[]>(() => [...DEFAULT_DEAL_SOURCES]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoading(true);

    listDealSources(companyId)
      .then((sources) => {
        if (!isMounted) return;

        const names = sources
          .map((source) => source?.name?.trim())
          .filter((name): name is string => Boolean(name));

        const merged = Array.from(
          new Set([
            ...(DEFAULT_DEAL_SOURCES as string[]),
            ...names,
            currentLeadSource ?? null,
          ].filter(Boolean))
        ) as string[];

        setDealSources(merged);
      })
      .catch((err) => {
        console.error("Failed to load deal sources", err);
        const merged = Array.from(
          new Set([
            ...(DEFAULT_DEAL_SOURCES as string[]),
            currentLeadSource ?? null,
          ].filter(Boolean))
        ) as string[];
        setDealSources(merged);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [companyId, currentLeadSource, open]);

  return {
    dealSources,
    isLoading,
  };
}
