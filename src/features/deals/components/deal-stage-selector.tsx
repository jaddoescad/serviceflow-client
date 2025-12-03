"use client";

import { useMemo, useState } from "react";
import { DEAL_STAGE_OPTIONS, SALES_DEAL_STAGE_OPTIONS, JOBS_DEAL_STAGE_OPTIONS } from "../constants";
import { StageDripPromptDialog } from "@/components/pipeline/stage-drip-prompt-dialog";
import { useToast } from "@/components/ui/toast";
import type { DealPipelineId, DealStageId, DealStageOption } from "../types";
import type { DripSequenceRecord } from "@/features/drips";

type StageValidation = {
  canMove: boolean;
  message: string | null;
};

type DealStageSelectorProps = {
  value: DealStageId;
  pipelineId?: DealPipelineId;
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
  appointmentCount?: number;
  proposalCount?: number;
  dealLabel: string;
  defaultDripsEnabled: boolean;
  dripSequencesByStage?: Record<DealStageId, DripSequenceRecord>;
  onStageChange?: (stage: DealStageId, enableDrips: boolean) => void;
  isUpdating?: boolean;
  stageChangeError?: string | null;
};

export function DealStageSelector({
  value,
  pipelineId,
  className,
  selectClassName,
  disabled = false,
  appointmentCount = 0,
  proposalCount = 0,
  dealLabel,
  defaultDripsEnabled,
  dripSequencesByStage,
  onStageChange,
  isUpdating = false,
  stageChangeError = null,
}: DealStageSelectorProps) {
  const [pendingStage, setPendingStage] = useState<DealStageId | null>(null);
  const { error: showError } = useToast();

  const options = useMemo(() => {
    if (pipelineId === "sales") {
      return SALES_DEAL_STAGE_OPTIONS;
    }
    if (pipelineId === "jobs") {
      return JOBS_DEAL_STAGE_OPTIONS;
    }
    return DEAL_STAGE_OPTIONS;
  }, [pipelineId]);

  const validateStageTransition = (targetStage: DealStageId): StageValidation => {
    // Check if moving to estimate_scheduled requires appointments
    if (targetStage === "estimate_scheduled" && appointmentCount < 1) {
      return {
        canMove: false,
        message: "Create an appointment before moving this deal to Estimate Scheduled.",
      };
    }

    // Check if proposal-based stages require proposals
    const proposalRequiredStages: DealStageId[] = ["in_draft", "proposals_sent", "proposals_rejected"];
    if (proposalRequiredStages.includes(targetStage) && proposalCount < 1) {
      return {
        canMove: false,
        message: "Create a proposal before moving this deal to this stage.",
      };
    }

    return { canMove: true, message: null };
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStage = event.target.value as DealStageId;

    if (nextStage === value) return;

    const validation = validateStageTransition(nextStage);

    if (!validation.canMove) {
      showError("Cannot Change Stage", validation.message ?? undefined);
      // Reset select to current value
      event.target.value = value;
      return;
    }

    // Show drip prompt dialog
    setPendingStage(nextStage);
  };

  const handleEnableDrips = () => {
    if (pendingStage && onStageChange) {
      onStageChange(pendingStage, true);
    }
    setPendingStage(null);
  };

  const handleDisableDrips = () => {
    if (pendingStage && onStageChange) {
      onStageChange(pendingStage, false);
    }
    setPendingStage(null);
  };

  const handleCancel = () => {
    setPendingStage(null);
  };

  const pendingStageOption: DealStageOption | null = pendingStage
    ? options.find((opt) => opt.id === pendingStage) ?? null
    : null;

  const pendingSequence = pendingStage && dripSequencesByStage
    ? dripSequencesByStage[pendingStage] ?? null
    : null;

  const selectWidthClass = selectClassName ?? "w-fit";

  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <select
        aria-label="Deal stage"
        value={value}
        onChange={handleChange}
        disabled={disabled || isUpdating}
        className={`${selectWidthClass} rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60`.trim()}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Drip Prompt Dialog */}
      <StageDripPromptDialog
        open={pendingStage !== null}
        stage={pendingStageOption}
        sequence={pendingSequence}
        dealLabel={dealLabel}
        defaultEnabled={defaultDripsEnabled}
        isSaving={isUpdating}
        error={stageChangeError}
        onEnable={handleEnableDrips}
        onDisable={handleDisableDrips}
        onClose={handleCancel}
      />
    </div>
  );
}
