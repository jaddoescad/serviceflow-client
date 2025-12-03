import { useCallback, useState } from "react";
import type { DealStageId } from "@/features/deals";
import type { DripSequenceRecord } from "@/features/drips";
import type { StagePromptState } from "../types";

type UseDripStateProps = {
  initialDripSequences: DripSequenceRecord[];
};

export function useDripState({ initialDripSequences }: UseDripStateProps) {
  const [dripSequencesByStage, setDripSequencesByStage] = useState<Record<DealStageId, DripSequenceRecord>>(() => {
    const base: Record<DealStageId, DripSequenceRecord> = {} as Record<DealStageId, DripSequenceRecord>;

    for (const sequence of initialDripSequences) {
      const stageId = sequence.stage_id as DealStageId;
      base[stageId] = {
        ...sequence,
        steps: [...(sequence.steps ?? [])].sort((a, b) => a.position - b.position),
      };
    }

    return base;
  });

  const [dripSettingsStageId, setDripSettingsStageId] = useState<DealStageId | null>(null);
  const [stagePromptState, setStagePromptState] = useState<StagePromptState | null>(null);
  const [stagePromptError, setStagePromptError] = useState<string | null>(null);
  const [isSchedulingStagePrompt, setIsSchedulingStagePrompt] = useState(false);
  const [dripActionDealId, setDripActionDealId] = useState<string | null>(null);

  const handleSequenceChange = useCallback((sequence: DripSequenceRecord) => {
    const stageId = sequence.stage_id as DealStageId;
    setDripSequencesByStage((previous) => ({
      ...previous,
      [stageId]: {
        ...sequence,
        steps: [...(sequence.steps ?? [])].sort((a, b) => a.position - b.position),
      },
    }));
  }, []);

  const handleSequenceCleared = useCallback((stageId: string) => {
    setDripSequencesByStage((previous) => {
      if (!stageId) {
        return previous;
      }
      const next = { ...previous };
      delete next[stageId as DealStageId];
      return next;
    });
  }, []);

  const openDripSettings = useCallback((stageId: DealStageId) => {
    setDripSettingsStageId(stageId);
  }, []);

  return {
    dripSequencesByStage,
    setDripSequencesByStage,
    dripSettingsStageId,
    setDripSettingsStageId,
    stagePromptState,
    setStagePromptState,
    stagePromptError,
    setStagePromptError,
    isSchedulingStagePrompt,
    setIsSchedulingStagePrompt,
    dripActionDealId,
    setDripActionDealId,
    handleSequenceChange,
    handleSequenceCleared,
    openDripSettings,
  };
}
