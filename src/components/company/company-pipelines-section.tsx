"use client";

import { useState } from "react";
import { usePipelines, useUpdateStage, useCreateStage, useDeleteStage, useReorderStages } from "@/features/pipelines";
import type { PipelineWithStages, PipelineStageRecord, CreateStageInput } from "@/features/pipelines";
import { STAGE_COLOR_OPTIONS } from "@/features/pipelines";

// Inline SVG icons to avoid external dependencies
function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconGripVertical({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconAlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

type CompanyPipelinesSectionProps = {
  companyId: string;
};

type EditingStage = {
  id: string;
  name: string;
  description: string;
  color: string;
  is_win_stage: boolean;
  is_loss_stage: boolean;
};

type NewStage = {
  pipelineKey: string;
  stage_key: string;
  name: string;
  description: string;
  color: string;
  is_win_stage: boolean;
  is_loss_stage: boolean;
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  sky: { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-800" },
  indigo: { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-800" },
  slate: { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-800" },
  emerald: { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" },
  rose: { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-800" },
  lime: { bg: "bg-lime-100", border: "border-lime-300", text: "text-lime-800" },
  teal: { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800" },
  blue: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  fuchsia: { bg: "bg-fuchsia-100", border: "border-fuchsia-300", text: "text-fuchsia-800" },
  amber: { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-800" },
  violet: { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-800" },
  cyan: { bg: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-800" },
  orange: { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800" },
  pink: { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800" },
};

function getColorClasses(color: string | null) {
  return COLOR_CLASSES[color ?? "slate"] ?? COLOR_CLASSES.slate;
}

function StageColorBadge({ color }: { color: string | null }) {
  const classes = getColorClasses(color);
  return (
    <span className={`inline-block w-4 h-4 rounded ${classes.bg} ${classes.border} border`} />
  );
}

function StageRow({
  stage,
  onEdit,
  onDelete,
  isDefault,
}: {
  stage: PipelineStageRecord;
  onEdit: () => void;
  onDelete: () => void;
  isDefault: boolean;
}) {
  const colorClasses = getColorClasses(stage.color);

  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-white border border-slate-200 rounded-lg group hover:border-slate-300 transition-colors">
      <IconGripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
      <StageColorBadge color={stage.color} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-slate-800">{stage.name}</span>
          {stage.is_win_stage && (
            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Win</span>
          )}
          {stage.is_loss_stage && (
            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Loss</span>
          )}
          {isDefault && (
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Default</span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 font-mono">{stage.stage_key}</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit stage"
        >
          <IconPencil className="w-3.5 h-3.5" />
        </button>
        {!isDefault && (
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete stage"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function EditStageForm({
  stage,
  onSave,
  onCancel,
  isSaving,
}: {
  stage: EditingStage;
  onSave: (data: EditingStage) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState(stage);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
            Color
          </label>
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={isSaving}
          >
            {STAGE_COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
          Description (optional)
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Brief description of this stage"
          disabled={isSaving}
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[12px] text-slate-700">
          <input
            type="checkbox"
            checked={formData.is_win_stage}
            onChange={(e) => setFormData({ ...formData, is_win_stage: e.target.checked, is_loss_stage: e.target.checked ? false : formData.is_loss_stage })}
            className="rounded border-slate-300"
            disabled={isSaving}
          />
          Win stage (counts as won deal)
        </label>
        <label className="flex items-center gap-2 text-[12px] text-slate-700">
          <input
            type="checkbox"
            checked={formData.is_loss_stage}
            onChange={(e) => setFormData({ ...formData, is_loss_stage: e.target.checked, is_win_stage: e.target.checked ? false : formData.is_win_stage })}
            className="rounded border-slate-300"
            disabled={isSaving}
          />
          Loss stage (counts as lost deal)
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-3 py-1.5 text-[12px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          disabled={isSaving || !formData.name.trim()}
        >
          <IconCheck className="w-3.5 h-3.5" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function NewStageForm({
  pipelineKey: initialPipelineKey,
  onSave,
  onCancel,
  isSaving,
}: {
  pipelineKey: string;
  onSave: (data: NewStage) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<NewStage>({
    pipelineKey: initialPipelineKey,
    stage_key: "",
    name: "",
    description: "",
    color: "slate",
    is_win_stage: false,
    is_loss_stage: false,
  });
  const [error, setError] = useState<string | null>(null);

  const generateStageKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);
  };

  const handleNameChange = (name: string) => {
    const generatedKey = generateStageKey(name);
    setFormData({ ...formData, name, stage_key: generatedKey });
    setError(null);
  };

  const validateAndSave = () => {
    if (!formData.name.trim()) {
      setError("Stage name is required");
      return;
    }
    if (!formData.stage_key.trim()) {
      setError("Stage key is required");
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(formData.stage_key)) {
      setError("Stage key must start with a letter and contain only lowercase letters, numbers, and underscores");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
      <div className="text-sm font-medium text-blue-800">Add New Stage</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g., Follow Up Required"
            disabled={isSaving}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
            Stage Key *
          </label>
          <input
            type="text"
            value={formData.stage_key}
            onChange={(e) => {
              setFormData({ ...formData, stage_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") });
              setError(null);
            }}
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="e.g., follow_up_required"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
            Color
          </label>
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={isSaving}
          >
            {STAGE_COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[12px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Brief description"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[12px] text-slate-700">
          <input
            type="checkbox"
            checked={formData.is_win_stage}
            onChange={(e) => setFormData({ ...formData, is_win_stage: e.target.checked, is_loss_stage: e.target.checked ? false : formData.is_loss_stage })}
            className="rounded border-slate-300"
            disabled={isSaving}
          />
          Win stage
        </label>
        <label className="flex items-center gap-2 text-[12px] text-slate-700">
          <input
            type="checkbox"
            checked={formData.is_loss_stage}
            onChange={(e) => setFormData({ ...formData, is_loss_stage: e.target.checked, is_win_stage: e.target.checked ? false : formData.is_win_stage })}
            className="rounded border-slate-300"
            disabled={isSaving}
          />
          Loss stage
        </label>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-[12px] text-red-600">
          <IconAlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={validateAndSave}
          className="px-3 py-1.5 text-[12px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          disabled={isSaving || !formData.name.trim() || !formData.stage_key.trim()}
        >
          <IconPlus className="w-3.5 h-3.5" />
          {isSaving ? "Adding..." : "Add Stage"}
        </button>
      </div>
    </div>
  );
}

function PipelineSection({
  pipeline,
  companyId,
}: {
  pipeline: PipelineWithStages;
  companyId: string;
}) {
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [showNewStageForm, setShowNewStageForm] = useState(false);

  const updateStageMutation = useUpdateStage(companyId);
  const createStageMutation = useCreateStage(companyId);
  const deleteStageMutation = useDeleteStage(companyId);

  const handleEditSave = (data: EditingStage) => {
    updateStageMutation.mutate(
      {
        stageId: data.id,
        data: {
          name: data.name,
          description: data.description || null,
          color: data.color,
          is_win_stage: data.is_win_stage,
          is_loss_stage: data.is_loss_stage,
        },
      },
      {
        onSuccess: () => setEditingStageId(null),
      }
    );
  };

  const handleNewStageSave = (data: NewStage) => {
    const createInput: CreateStageInput = {
      pipeline_key: data.pipelineKey,
      stage_key: data.stage_key,
      name: data.name,
      description: data.description || undefined,
      color: data.color,
      is_win_stage: data.is_win_stage,
      is_loss_stage: data.is_loss_stage,
    };
    createStageMutation.mutate(createInput, {
      onSuccess: () => setShowNewStageForm(false),
    });
  };

  const handleDelete = (stageId: string, stageName: string) => {
    if (confirm(`Are you sure you want to delete the "${stageName}" stage? Deals in this stage will need to be moved to another stage.`)) {
      deleteStageMutation.mutate(stageId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{pipeline.name}</h3>
          {pipeline.description && (
            <p className="text-[11px] text-slate-500">{pipeline.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowNewStageForm(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          disabled={showNewStageForm}
        >
          <IconPlus className="w-3.5 h-3.5" />
          Add Stage
        </button>
      </div>

      <div className="space-y-2">
        {pipeline.stages.map((stage) =>
          editingStageId === stage.id ? (
            <EditStageForm
              key={stage.id}
              stage={{
                id: stage.id,
                name: stage.name,
                description: stage.description ?? "",
                color: stage.color ?? "slate",
                is_win_stage: stage.is_win_stage,
                is_loss_stage: stage.is_loss_stage,
              }}
              onSave={handleEditSave}
              onCancel={() => setEditingStageId(null)}
              isSaving={updateStageMutation.isPending}
            />
          ) : (
            <StageRow
              key={stage.id}
              stage={stage}
              onEdit={() => setEditingStageId(stage.id)}
              onDelete={() => handleDelete(stage.id, stage.name)}
              isDefault={stage.is_default}
            />
          )
        )}
        {showNewStageForm && (
          <NewStageForm
            pipelineKey={pipeline.pipeline_key}
            onSave={handleNewStageSave}
            onCancel={() => setShowNewStageForm(false)}
            isSaving={createStageMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

export function CompanyPipelinesSection({ companyId }: CompanyPipelinesSectionProps) {
  const { data: pipelines, isLoading, error } = usePipelines(companyId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-500">Loading pipelines...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <IconAlertCircle className="w-4 h-4" />
        Failed to load pipelines. Please try again.
      </div>
    );
  }

  if (!pipelines || pipelines.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-8 text-center">
        No pipelines configured. Pipeline stages will be initialized automatically.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Pipeline Stages</h2>
        <p className="text-[12px] text-slate-500 mt-1">
          Configure the stages for your sales and jobs pipelines. Drag to reorder stages, or add custom stages for your workflow.
        </p>
      </div>

      <div className="space-y-8">
        {pipelines.map((pipeline) => (
          <PipelineSection
            key={pipeline.id}
            pipeline={pipeline}
            companyId={companyId}
          />
        ))}
      </div>
    </section>
  );
}
