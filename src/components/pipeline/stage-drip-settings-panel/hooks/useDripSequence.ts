import { useCallback, useEffect, useState } from "react";
import type { DealPipelineId, DealStageOption } from "@/features/deals";
import type { DripSequenceRecord, DripStepRecord } from "@/features/drips";
import {
  fetchSequence,
  upsertSequence,
  createStep,
  updateStep,
  deleteStep,
  reorderSteps,
} from "@/features/drips";
import type { StepDraft, StepDrafts } from "../types";
import { formatDefaultSequenceName } from "../constants";

type UseDripSequenceOptions = {
  open: boolean;
  companyId: string;
  pipelineId: DealPipelineId;
  stage: DealStageOption | null;
  sequence: DripSequenceRecord | null;
  onSequenceChange: (next: DripSequenceRecord) => void;
  onSequenceCleared: (stageId: string) => void;
};

export function useDripSequence({
  open,
  companyId,
  pipelineId,
  stage,
  sequence,
  onSequenceChange,
  onSequenceCleared,
}: UseDripSequenceOptions) {
  const [workingSequence, setWorkingSequence] = useState<DripSequenceRecord | null>(sequence);
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [stepDrafts, setStepDrafts] = useState<StepDrafts>({});
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Reset state when sequence/stage changes or panel opens
  useEffect(() => {
    setWorkingSequence(sequence);
    setPanelError(null);
    setIsSavingToggle(false);
    setIsAddingStep(false);
    setStepDrafts({});
    setExpandedStepId(sequence?.steps?.[0]?.id ?? null);
  }, [sequence, stage?.id, open]);

  // Fetch sequence if not provided
  useEffect(() => {
    if (!open || !stage || sequence) {
      return;
    }

    let isActive = true;

    fetchSequence(companyId, pipelineId, stage.id)
      .then((fetched) => {
        if (!isActive) return;
        setWorkingSequence(fetched);
        if (fetched) {
          onSequenceChange(fetched);
        }
      })
      .catch((error) => {
        if (!isActive) return;
        console.error("Failed to load drip sequence", error);
        setPanelError(
          error instanceof Error ? error.message : "We couldn't load this drip sequence."
        );
      });

    return () => {
      isActive = false;
    };
  }, [open, stage, sequence, companyId, pipelineId, onSequenceChange]);

  const updateDraftState = useCallback((stepId: string, patch: Partial<StepDraft>) => {
    setStepDrafts((previous) => ({
      ...previous,
      [stepId]: {
        isSaving: previous[stepId]?.isSaving ?? false,
        error: previous[stepId]?.error ?? null,
        ...patch,
      },
    }));
  }, []);

  const ensureSequence = useCallback(
    async (initialEnabled: boolean): Promise<DripSequenceRecord> => {
      if (workingSequence) {
        return workingSequence;
      }

      if (!stage) {
        throw new Error("Missing stage context.");
      }

      const created = await upsertSequence({
        company_id: companyId,
        pipeline_id: pipelineId,
        stage_id: stage.id,
        name: formatDefaultSequenceName(stage),
        is_enabled: initialEnabled,
      });

      setWorkingSequence(created);
      onSequenceChange(created);

      return created;
    },
    [workingSequence, stage, companyId, pipelineId, onSequenceChange]
  );

  const handleToggle = useCallback(
    async (value: boolean) => {
      if (!stage) return;

      setPanelError(null);
      setIsSavingToggle(true);

      try {
        const baseSequence = await ensureSequence(value);
        const updated = await upsertSequence({
          id: baseSequence.id,
          company_id: companyId,
          pipeline_id: pipelineId,
          stage_id: stage.id,
          name: baseSequence.name || formatDefaultSequenceName(stage),
          is_enabled: value,
        });

        setWorkingSequence(updated);
        onSequenceChange(updated);
      } catch (error) {
        console.error("Failed to toggle drip sequence", error);
        setPanelError(
          error instanceof Error ? error.message : "We couldn't update this drip sequence. Try again."
        );
      } finally {
        setIsSavingToggle(false);
      }
    },
    [stage, ensureSequence, companyId, pipelineId, onSequenceChange]
  );

  const handleAddStep = useCallback(async () => {
    if (!stage) return;

    setPanelError(null);
    setIsAddingStep(true);

    try {
      const current = await ensureSequence(workingSequence?.is_enabled ?? false);
      const nextPosition = (current.steps?.length ?? 0) + 1;
      const updated = await createStep({
        sequence_id: current.id,
        position: nextPosition,
        delay_type: "after",
        delay_value: 10,
        delay_unit: "minutes",
        channel: "email",
        email_subject: "Thanks for reaching out!",
        email_body: "Hi {{first_name}}, just checking in.",
        sms_body: null,
      });

      setWorkingSequence(updated);
      onSequenceChange(updated);
      const newestStep = [...(updated.steps ?? [])]
        .sort((a, b) => a.position - b.position)
        .at(-1);
      setExpandedStepId(newestStep?.id ?? null);
    } catch (error) {
      console.error("Failed to add drip step", error);
      setPanelError(error instanceof Error ? error.message : "We couldn't add this drip step.");
    } finally {
      setIsAddingStep(false);
    }
  }, [stage, ensureSequence, workingSequence?.is_enabled, onSequenceChange]);

  const handleSaveStep = useCallback(
    async (step: DripStepRecord) => {
      updateDraftState(step.id, { isSaving: true, error: null });

      try {
        const updated = await updateStep({
          id: step.id,
          delay_type: step.delay_type,
          delay_value: step.delay_value,
          delay_unit: step.delay_unit,
          channel: step.channel,
          email_subject: step.email_subject,
          email_body: step.email_body,
          sms_body: step.sms_body,
        });

        setWorkingSequence(updated);
        onSequenceChange(updated);
        updateDraftState(step.id, { isSaving: false, error: null });
      } catch (error) {
        console.error("Failed to update drip step", error);
        updateDraftState(step.id, {
          isSaving: false,
          error: error instanceof Error ? error.message : "We couldn't save this drip step.",
        });
      }
    },
    [onSequenceChange, updateDraftState]
  );

  const handleDeleteStep = useCallback(
    async (stepId: string) => {
      updateDraftState(stepId, { isSaving: true, error: null });

      try {
        const updated = await deleteStep(stepId);

        if (!updated) {
          if (stage) {
            onSequenceCleared(stage.id);
          }
          setWorkingSequence(null);
          setStepDrafts((previous) => {
            const copy = { ...previous };
            delete copy[stepId];
            return copy;
          });
          setExpandedStepId(null);
          return;
        }

        const normalizedOrder = updated.steps.map((item: DripStepRecord, index: number) => ({
          id: item.id,
          position: index + 1,
        }));
        const reordered = await reorderSteps({
          sequence_id: updated.id,
          order: normalizedOrder,
        });

        setWorkingSequence(reordered);
        onSequenceChange(reordered);

        const sortedSteps = [...(reordered.steps ?? [])].sort((a, b) => a.position - b.position);
        setExpandedStepId((previous) => {
          if (sortedSteps.length === 0) return null;
          if (previous && previous !== stepId && sortedSteps.some((item) => item.id === previous)) {
            return previous;
          }
          return sortedSteps[0]?.id ?? null;
        });

        setStepDrafts((previous) => {
          const copy = { ...previous };
          delete copy[stepId];
          return copy;
        });
      } catch (error) {
        console.error("Failed to delete drip step", error);
        updateDraftState(stepId, {
          isSaving: false,
          error: error instanceof Error ? error.message : "We couldn't delete this drip step.",
        });
      }
    },
    [stage, onSequenceChange, onSequenceCleared, updateDraftState]
  );

  const handleMoveStep = useCallback(
    async (stepId: string, direction: "up" | "down") => {
      if (!workingSequence) return;

      const sorted = [...workingSequence.steps].sort((a, b) => a.position - b.position);
      const index = sorted.findIndex((item) => item.id === stepId);

      if (index === -1) return;

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) return;

      [sorted[index], sorted[swapIndex]] = [sorted[swapIndex], sorted[index]];

      const orderPayload = sorted.map((item, positionIndex) => ({
        id: item.id,
        position: positionIndex + 1,
      }));

      updateDraftState(stepId, { isSaving: true, error: null });

      try {
        const updated = await reorderSteps({
          sequence_id: workingSequence.id,
          order: orderPayload,
        });

        setWorkingSequence(updated);
        onSequenceChange(updated);
        updateDraftState(stepId, { isSaving: false, error: null });
      } catch (error) {
        console.error("Failed to reorder drip steps", error);
        updateDraftState(stepId, {
          isSaving: false,
          error: error instanceof Error ? error.message : "We couldn't move this drip step.",
        });
      }
    },
    [workingSequence, onSequenceChange, updateDraftState]
  );

  const handleStepChange = useCallback(
    (stepId: string, updates: Partial<DripStepRecord>) => {
      setWorkingSequence((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          steps: previous.steps.map((item) =>
            item.id === stepId ? { ...item, ...updates } : item
          ),
        };
      });
    },
    []
  );

  const handleToggleExpand = useCallback((stepId: string) => {
    setExpandedStepId((previous) => (previous === stepId ? null : stepId));
  }, []);

  const isBusy =
    isSavingToggle || isAddingStep || Object.values(stepDrafts).some((draft) => draft.isSaving);

  return {
    workingSequence,
    isSavingToggle,
    panelError,
    isAddingStep,
    stepDrafts,
    expandedStepId,
    isBusy,
    handleToggle,
    handleAddStep,
    handleSaveStep,
    handleDeleteStep,
    handleMoveStep,
    handleStepChange,
    handleToggleExpand,
    setPanelError,
  };
}
