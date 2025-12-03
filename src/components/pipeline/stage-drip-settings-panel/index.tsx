"use client";

import { useMemo } from "react";
import type { StageDripSettingsPanelProps } from "./types";
import { useDripSequence } from "./hooks/useDripSequence";
import {
  DripStepCard,
  EnableDripsToggle,
  PanelHeader,
} from "./components";

export type { StageDripSettingsPanelProps } from "./types";

export function StageDripSettingsPanel({
  open,
  companyId,
  pipelineId,
  stage,
  sequence,
  onClose,
  onSequenceChange,
  onSequenceCleared,
  variant = "drawer",
  className,
}: StageDripSettingsPanelProps) {
  const {
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
  } = useDripSequence({
    open,
    companyId,
    pipelineId,
    stage,
    sequence,
    onSequenceChange,
    onSequenceCleared,
  });

  const sortedSteps = useMemo(() => {
    if (!workingSequence?.steps) return [];
    return [...workingSequence.steps].sort((a, b) => a.position - b.position);
  }, [workingSequence?.steps]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (!isBusy) {
      setPanelError(null);
      onClose();
    }
  };

  const stageLabel = stage?.label ?? "Sales stage";
  const sequenceEnabled = workingSequence?.is_enabled ?? false;
  const isInline = variant === "inline";
  const headerPadding = isInline ? "px-4 py-3" : "px-5 py-4";
  const bodyPadding = isInline ? "px-4 py-4" : "px-5 py-4";
  const footerPadding = isInline ? "px-4 py-3" : "px-5 py-4";
  const inlineWrapperClass = [
    "flex h-full min-h-0 flex-col bg-slate-50 shadow-sm",
    className ?? "rounded-lg border border-slate-200",
  ].join(" ");

  const panelContent = (
    <>
      <PanelHeader
        pipelineId={pipelineId}
        stageLabel={stageLabel}
        onClose={handleClose}
        padding={headerPadding}
      />

      <div className={`flex-1 overflow-y-auto ${bodyPadding}`}>
        <EnableDripsToggle
          enabled={sequenceEnabled}
          isSaving={isSavingToggle}
          stageLabel={stageLabel}
          onToggle={handleToggle}
        />

        {panelError ? (
          <p className="mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
            {panelError}
          </p>
        ) : null}

        {!sequenceEnabled ? (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
            Drips are currently disabled for this stage. You can still edit messages and add new steps before
            turning them on.
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {sortedSteps.length > 0 ? (
            sortedSteps.map((step, index) => (
              <DripStepCard
                key={step.id}
                step={step}
                index={index}
                isFirst={index === 0}
                isLast={index === sortedSteps.length - 1}
                variant={variant}
                isExpanded={!isInline || expandedStepId === step.id}
                draft={stepDrafts[step.id]}
                onSave={handleSaveStep}
                onDelete={handleDeleteStep}
                onMove={handleMoveStep}
                onToggleExpand={handleToggleExpand}
                onStepChange={handleStepChange}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-[12px] text-slate-600">
              No drips configured yet. Add a drip to send an automated message when deals arrive here.
            </div>
          )}
        </div>
      </div>

      <footer className={`border-t border-slate-200 ${footerPadding}`}>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleAddStep}
            disabled={isAddingStep}
            className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAddingStep ? "Adding…" : "Add drip"}
          </button>
        </div>
      </footer>
    </>
  );

  if (isInline) {
    return <div className={inlineWrapperClass}>{panelContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/60" role="presentation" onClick={handleClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-slate-50 shadow-2xl">
        {panelContent}
      </aside>
    </div>
  );
}
