"use client";

import { useEffect, useMemo, useState } from "react";
import { createCrew, updateCrew, deleteCrew } from "@/features/crews";
import type { CrewRecord } from "@/features/crews";

const sortCrews = (items: CrewRecord[]): CrewRecord[] => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
};

type AlertState = {
  type: "success" | "error";
  message: string;
};

type CrewsPageClientProps = {
  companyId: string;
  canManage: boolean;
  initialCrews: CrewRecord[];
  userId: string;
};

type CrewModalMode = "create" | "edit";

type CrewModalProps = {
  open: boolean;
  mode: CrewModalMode;
  name: string;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
};

function CrewModal({ open, mode, name, onNameChange, onClose, onSubmit, isSubmitting, error }: CrewModalProps) {
  if (!open) {
    return null;
  }

  const heading = mode === "create" ? "Add Crew" : "Edit Crew";
  const action = isSubmitting ? "Saving…" : "Save";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
      <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h2 className="text-sm font-semibold text-slate-900">{heading}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
          className="flex flex-col gap-3 bg-slate-50 px-4 py-4 text-[12px]"
        >
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Crew Name</span>
            <input
              autoFocus
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="e.g. Interior Team"
              className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={80}
            />
          </label>
          {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CrewsPageClient({ companyId, canManage, initialCrews, userId }: CrewsPageClientProps) {
  // Repository removed in favor of direct service calls

  const [crews, setCrews] = useState<CrewRecord[]>(() => sortCrews(initialCrews));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CrewModalMode>("create");
  const [editingCrew, setEditingCrew] = useState<CrewRecord | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    if (!alert) {
      return undefined;
    }

    const timer = window.setTimeout(() => setAlert(null), 3000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const openCreateModal = () => {
    if (!canManage) {
      return;
    }
    setModalMode("create");
    setEditingCrew(null);
    setName("");
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (crew: CrewRecord) => {
    if (!canManage) {
      return;
    }
    setModalMode("edit");
    setEditingCrew(crew);
    setName(crew.name);
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }
    setModalOpen(false);
    setEditingCrew(null);
    setName("");
    setModalError(null);
  };

  const upsertCrew = async () => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      setModalError("Crew name is required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      if (modalMode === "create") {
        const created = await createCrew({ companyId, name: trimmed, userId });
        setCrews((prev) => sortCrews([...prev, created]));
        setAlert({ type: "success", message: "Crew added." });
      } else if (editingCrew) {
        const updated = await updateCrew(editingCrew.id, companyId, { name: trimmed });
        setCrews((prev) => sortCrews(prev.map((item) => (item.id === updated.id ? updated : item))));
        setAlert({ type: "success", message: "Crew updated." });
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save crew", error);
      const code = typeof error === "object" && error && "code" in error ? (error as { code?: string }).code : null;
      if (code === "23505") {
        setModalError("A crew with this name already exists.");
      } else {
        setModalError("We couldn't save the crew. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (crew: CrewRecord) => {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(`Delete ${crew.name}? This can't be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteCrew(crew.id, companyId);
      setCrews((prev) => prev.filter((item) => item.id !== crew.id));
      setAlert({ type: "success", message: "Crew removed." });
    } catch (error) {
      console.error("Failed to delete crew", error);
      setAlert({ type: "error", message: "We couldn't delete the crew." });
    }
  };

  const showEmptyState = crews.length === 0;

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold text-slate-900">Crews</h1>
          <p className="text-[11px] text-slate-500">Create crews and assign them to scheduled jobs.</p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Add Crew
          </button>
        ) : null}
      </header>

      {alert ? (
        <div
          className={`mx-4 mt-3 rounded border px-3 py-2 text-[11px] font-medium ${alert.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-600"
            }`}
        >
          {alert.message}
        </div>
      ) : null}

      <section className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {showEmptyState ? (
          <p className="rounded border border-dashed border-slate-200 px-4 py-6 text-center text-[12px] text-slate-500">
            {canManage ? "No crews yet. Add your first crew to get started." : "No crews have been added yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {crews.map((crew) => (
              <li
                key={crew.id}
                className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{crew.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Added {new Date(crew.created_at).toLocaleDateString()}
                  </span>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(crew)}
                      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(crew)}
                      className="rounded border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <CrewModal
        open={modalOpen}
        mode={modalMode}
        name={name}
        onNameChange={setName}
        onClose={closeModal}
        onSubmit={upsertCrew}
        isSubmitting={isSubmitting}
        error={modalError}
      />
    </div>
  );
}
