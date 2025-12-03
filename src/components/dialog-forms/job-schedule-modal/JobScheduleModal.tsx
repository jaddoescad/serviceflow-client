"use client";

import type { JobScheduleModalProps } from "./types";
import { useJobScheduleForm } from "./useJobScheduleForm";
import { DetailsSection } from "./DetailsSection";
import { AssignmentSection } from "./AssignmentSection";
import { ScheduleSection } from "./ScheduleSection";
import { CommunicationSection } from "./CommunicationSection";

export function JobScheduleModal(props: JobScheduleModalProps) {
  const { open, mode, onClose, deal } = props;

  const {
    form,
    error,
    isSubmitting,
    isLoadingCrews,
    stageLabel,
    dealTitle,
    projectManagerSelectOptions,
    crewSelectOptions,
    primaryButtonLabel,
    timeOptions,
    handleChange,
    handleTextareaChange,
    handleSubmit,
  } = useJobScheduleForm(props);

  if (!open || !deal || !form) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-schedule-modal-title"
    >
      <div className="absolute inset-0 bg-slate-950/40" aria-hidden />
      <div className="relative flex h-full w-full items-start justify-center pt-6 px-4" onClick={onClose}>
        <div
          className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              {mode === "edit" ? "Reschedule Job" : "Schedule Job"}
            </p>
            <h2 id="job-schedule-modal-title" className="text-sm font-semibold text-slate-900">
              {dealTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 px-4 py-4 text-[12px]">
          <DetailsSection dealTitle={dealTitle} />

          <AssignmentSection
            form={form}
            projectManagerSelectOptions={projectManagerSelectOptions}
            crewSelectOptions={crewSelectOptions}
            isLoadingCrews={isLoadingCrews}
            onChange={handleChange}
          />

          <ScheduleSection
            form={form}
            stageLabel={stageLabel}
            timeOptions={timeOptions}
            onChange={handleChange}
          />

          <CommunicationSection
            form={form}
            onChange={handleChange}
            onTextareaChange={handleTextareaChange}
          />

          {error ? (
            <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <footer className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:from-emerald-600 hover:via-teal-600 hover:to-sky-600 disabled:opacity-70"
            >
              {primaryButtonLabel}
            </button>
          </footer>
        </form>
        </div>
      </div>
    </div>
  );
}
