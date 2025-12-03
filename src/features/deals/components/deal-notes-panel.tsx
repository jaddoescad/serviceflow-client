"use client";

import { useState } from "react";
import type { KeyboardEventHandler } from "react";
import type { DealDetailSnapshot } from "@/types/deal-details";

type DealNotesPanelProps = Pick<DealDetailSnapshot, "notes"> & {
  className?: string;
  onCreateNote?: (body: string) => Promise<unknown>;
};

export function DealNotesPanel({ notes, className, onCreateNote }: DealNotesPanelProps) {
  const isReadOnly = !onCreateNote;
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = () => {
    setDraft("");
    setErrorMessage(null);
  };

  const handleSave = async () => {
    const nextBody = draft.trim();
    if (nextBody === "") {
      setErrorMessage("Add a quick note before saving.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onCreateNote?.(nextBody);
      setDraft("");
    } catch (error) {
      console.error("Failed to save deal note", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to save note right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (!isSaving) {
        void handleSave();
      }
    }
  };

  return (
    <section
      className={`flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
      </header>

      <div className="flex-1 space-y-3 overflow-auto pr-1">
        {notes.map((note) => (
          <article key={note.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium text-slate-600">{note.author}</span>
              <span>{new Date(note.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-slate-700">{note.body}</p>
          </article>
        ))}
        {notes.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-[12px] text-slate-500">
            No notes yet. Add the first one to keep your team aligned.
          </div>
        ) : null}
      </div>

      {!isReadOnly && (
        <footer className="mt-3 border-t border-slate-100 pt-3">
          <textarea
            rows={3}
            placeholder="Capture a quick note..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-700 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
          />
          {errorMessage ? (
            <p className="mt-2 text-[11px] text-rose-600">{errorMessage}</p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={draft.trim() === "" || isSaving}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
