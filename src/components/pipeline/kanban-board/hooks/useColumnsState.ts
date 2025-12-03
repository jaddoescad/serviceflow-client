import { useCallback, useEffect, useState } from "react";
import type { DealRecord, DealStageOption } from "@/features/deals";
import type { DealsByStage } from "../types";
import { buildColumns } from "../utils";

type UseColumnsStateProps = {
  initialDeals: DealRecord[];
  stages: DealStageOption[];
};

export function useColumnsState({ initialDeals, stages }: UseColumnsStateProps) {
  const [columns, setColumns] = useState<DealsByStage>(() => buildColumns(initialDeals, stages));

  // Sync columns with initialDeals
  useEffect(() => {
    setColumns(buildColumns(initialDeals, stages));
  }, [initialDeals, stages]);

  const applyDealPatch = useCallback((dealId: string, patch: Partial<DealRecord>) => {
    setColumns((previous) => {
      const next: DealsByStage = {};

      for (const [stageId, deals] of Object.entries(previous)) {
        next[stageId] = deals.map((item) => (item.id === dealId ? { ...item, ...patch } : item));
      }

      return next;
    });
  }, []);

  return {
    columns,
    setColumns,
    applyDealPatch,
  };
}
