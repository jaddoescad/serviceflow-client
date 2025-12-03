"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StageDripSettingsPanel } from "@/components/pipeline/stage-drip-settings-panel";
import { DEAL_STAGE_PIPELINE_MAP } from "@/features/deals";
import type { DealPipelineId, DealStageId, DealStageOption } from "@/features/deals";
import { formatDripStepSummary } from "@/lib/drip-formatters";
import type { DripSequenceRecord, DripStepRecord } from "@/features/drips";

type DripsManagementViewProps = {
  companyId: string;
  salesStages: DealStageOption[];
  jobsStages: DealStageOption[];
  initialSequences: DripSequenceRecord[];
};

const sortSteps = (steps: DripStepRecord[] | null | undefined): DripStepRecord[] =>
  [...(steps ?? [])].sort((a, b) => a.position - b.position);

export function DripsManagementView({
  companyId,
  salesStages,
  jobsStages,
  initialSequences,
}: DripsManagementViewProps) {
  const [sequenceByStage, setSequenceByStage] = useState<Record<DealStageId, DripSequenceRecord>>(() => {
    const map: Partial<Record<DealStageId, DripSequenceRecord>> = {};

    for (const sequence of initialSequences) {
      map[sequence.stage_id as DealStageId] = {
        ...sequence,
        steps: sortSteps(sequence.steps),
      };
    }

    return map as Record<DealStageId, DripSequenceRecord>;
  });
  const [activeStageId, setActiveStageId] = useState<DealStageId | null>(null);
  const [activePipelineId, setActivePipelineId] = useState<DealPipelineId>(() => {
    if (salesStages.length > 0) {
      return "sales";
    }

    if (jobsStages.length > 0) {
      return "jobs";
    }

    return "sales";
  });

  const stageOptionMap = useMemo(() => {
    const map = new Map<DealStageId, DealStageOption>();

    for (const stage of salesStages) {
      map.set(stage.id as DealStageId, stage);
    }

    for (const stage of jobsStages) {
      map.set(stage.id as DealStageId, stage);
    }

    return map;
  }, [salesStages, jobsStages]);

  const pipelineByStage = useMemo(() => {
    const map = new Map<DealStageId, DealPipelineId>();

    for (const stage of salesStages) {
      map.set(stage.id as DealStageId, "sales");
    }

    for (const stage of jobsStages) {
      map.set(stage.id as DealStageId, "jobs");
    }

    return map;
  }, [salesStages, jobsStages]);

  const handleSequenceChange = useCallback((sequence: DripSequenceRecord) => {
    const stageId = sequence.stage_id as DealStageId;
    setSequenceByStage((previous) => ({
      ...previous,
      [stageId]: {
        ...sequence,
        steps: sortSteps(sequence.steps),
      },
    }));
  }, []);

  const handleSequenceCleared = useCallback((stageId: string) => {
    setSequenceByStage((previous) => {
      if (!stageId) {
        return previous;
      }

      const next = { ...previous };
      delete next[stageId as DealStageId];
      return next;
    });
  }, []);

  const pipelines = useMemo(
    () => [
      { pipelineId: "sales" as DealPipelineId, title: "Sales pipeline", stages: salesStages },
      { pipelineId: "jobs" as DealPipelineId, title: "Jobs pipeline", stages: jobsStages },
    ],
    [salesStages, jobsStages]
  );

  const availablePipelines = pipelines.filter((item) => item.stages.length > 0);
  const pipelineTabs = availablePipelines.length > 0 ? availablePipelines : pipelines;

  useEffect(() => {
    if (activePipelineId === "sales" && salesStages.length === 0 && jobsStages.length > 0) {
      setActivePipelineId("jobs");
      setActiveStageId(null);
      return;
    }

    if (activePipelineId === "jobs" && jobsStages.length === 0 && salesStages.length > 0) {
      setActivePipelineId("sales");
      setActiveStageId(null);
    }
  }, [activePipelineId, salesStages.length, jobsStages.length]);

  const activeSection = useMemo(() => {
    const match = pipelines.find((item) => item.pipelineId === activePipelineId);
    if (match) {
      return match;
    }
    return pipelines[0] ?? { pipelineId: activePipelineId, title: "", stages: [] };
  }, [pipelines, activePipelineId]);

  const activeStage = activeStageId ? stageOptionMap.get(activeStageId) ?? null : null;
  const activeSequence = activeStageId ? sequenceByStage[activeStageId] ?? null : null;
  const activePipeline: DealPipelineId = activeStageId
    ? pipelineByStage.get(activeStageId) ?? DEAL_STAGE_PIPELINE_MAP[activeStageId] ?? "sales"
    : "sales";

  const activeStages = activeSection?.stages ?? [];

  return (
    <div className="flex h-full flex-1 min-h-0 flex-col">
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
        {pipelineTabs.map((section) => {
          const isActive = section.pipelineId === activePipelineId;
          return (
            <button
              key={section.pipelineId}
              type="button"
              onClick={() => {
                setActivePipelineId(section.pipelineId);
                setActiveStageId(null);
              }}
              className={`inline-flex items-center rounded-t-md border-b-2 px-3 py-1 text-[11px] font-semibold transition ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 min-h-0 flex-col gap-4 py-4 lg:flex-row">
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="space-y-3">
            {activeStages.length === 0 ? (
              <p className="text-[11px] leading-snug text-slate-500">
                No stages available for this pipeline.
              </p>
            ) : (
              activeStages.map((stage) => {
                const stageId = stage.id as DealStageId;
                const sequence = sequenceByStage[stageId];
                const stepCount = sequence?.steps?.length ?? 0;
                const sequenceCount = sequence ? 1 : 0;
                const hasSteps = stepCount > 0;
                const isEnabled = Boolean(sequence?.is_enabled && hasSteps);
                const isSelected = activeStageId === stageId;
                const previewSteps = sequence ? sortSteps(sequence.steps).slice(0, 3) : [];
                const summaryText = `${sequenceCount} Sequence${sequenceCount === 1 ? "" : "s"} • ${stepCount} Drip${
                  stepCount === 1 ? "" : "s"
                }`;
                const badgeClasses = isEnabled
                  ? "bg-blue-100 text-blue-700"
                  : hasSteps
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-600";
                const badgeLabel = isEnabled ? "Drips on" : hasSteps ? "Drips off" : "No drips";

                return (
                  <article
                    key={stage.id}
                    className={`rounded-lg border transition ${
                      isSelected
                        ? "border-blue-400 bg-blue-50/60 shadow-sm"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStageId(stageId)}
                      className={`flex w-full flex-col gap-1 px-3 py-2 text-left transition ${
                        isSelected ? "bg-blue-50/40" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-slate-900">{stage.label}</p>
                        <span className="text-[10px] font-medium text-slate-500">{summaryText}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClasses}`}
                        >
                          {badgeLabel}
                        </span>
                        {!sequence ? (
                          <span className="text-[10px] text-slate-500">Automation not configured</span>
                        ) : null}
                      </div>
                    </button>

                    {sequence ? (
                      <div className="border-t border-slate-200 px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold text-slate-900">
                              {sequence.name || `${stage.label} Drip`}
                            </p>
                            <p className="text-[10px] text-slate-500">Trigger: Deal enters {stage.label}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveStageId(stageId)}
                            className="inline-flex items-center rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100"
                          >
                            Manage
                          </button>
                        </div>
                        {previewSteps.length > 0 ? (
                          <ul className="mt-2 space-y-1.5">
                            {previewSteps.map((step) => (
                              <li
                                key={step.id}
                                className="flex items-start gap-1.5 text-[10px] text-slate-600"
                              >
                                <span
                                  aria-hidden
                                  className="mt-[5px] inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400"
                                />
                                <span>{formatDripStepSummary(step)}</span>
                              </li>
                            ))}
                            {stepCount > previewSteps.length ? (
                              <li className="text-[10px] font-medium text-slate-500">
                                + {stepCount - previewSteps.length} more drip
                                {stepCount - previewSteps.length === 1 ? "" : "s"}
                              </li>
                            ) : null}
                          </ul>
                        ) : (
                          <p className="mt-2 text-[10px] text-slate-500">No messages configured yet.</p>
                        )}
                      </div>
                    ) : (
                      <div className="border-t border-dashed border-slate-200 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setActiveStageId(stageId)}
                          className="inline-flex items-center rounded border border-blue-600 bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-blue-700"
                        >
                          + Add Sequence
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-slate-200 lg:hidden" aria-hidden />

        <div className="flex-1 min-h-[320px] overflow-hidden">
          {activeStageId ? (
            <StageDripSettingsPanel
              open={Boolean(activeStageId)}
              variant="inline"
              companyId={companyId}
              pipelineId={activePipeline}
              stage={activeStage}
              sequence={activeSequence}
              onClose={() => setActiveStageId(null)}
              onSequenceChange={handleSequenceChange}
              onSequenceCleared={handleSequenceCleared}
              className="rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center text-[12px] text-slate-500">
              Select a stage to review and edit its drips.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
