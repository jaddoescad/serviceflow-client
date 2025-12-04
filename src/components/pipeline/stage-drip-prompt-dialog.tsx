"use client";

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from "@/components/ui/library";
import type { DealStageOption } from "@/features/deals";
import type { DripSequenceRecord } from "@/features/drips";

type StageDripPromptDialogProps = {
  open: boolean;
  stage: DealStageOption | null;
  sequence: DripSequenceRecord | null;
  dealLabel: string;
  defaultEnabled: boolean;
  isSaving: boolean;
  error: string | null;
  onEnable: () => void;
  onDisable: () => void;
  onClose: () => void;
};

export function StageDripPromptDialog({
  open,
  stage,
  sequence,
  dealLabel,
  defaultEnabled,
  isSaving,
  error,
  onEnable,
  onDisable,
  onClose,
}: StageDripPromptDialogProps) {
  if (!open) {
    return null;
  }

  const stageLabel = stage?.label ?? "this stage";
  const hasConfiguredDrips = Boolean(sequence?.is_enabled && sequence?.steps?.length);

  return (
    <Modal open={open} onClose={onClose} ariaLabel={`Enable drips for ${stageLabel}`} size="sm">
      <ModalHeader title={`Enable drips for ${stageLabel}?`} onClose={onClose} className="pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Enable Drips</p>
      </ModalHeader>

      <ModalBody className="space-y-2 text-[12px]">
        <p className="text-slate-600">
          {dealLabel} just moved to {stageLabel}.{" "}
          {hasConfiguredDrips
            ? "Turn on drips to automatically send the scheduled emails and texts for this column."
            : "No drip steps are configured yet, but you can enable drips now and add steps later."}
        </p>
        {error ? (
          <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">{error}</p>
        ) : null}
      </ModalBody>

      <ModalFooter className="justify-between">
        <Button variant="secondary" onClick={onDisable} disabled={isSaving}>
          {defaultEnabled ? "Disable drips" : "Keep disabled"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onEnable} loading={isSaving} loadingText="Saving…">
            Enable drips
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
