import { useState } from "react";

type QuoteClientMessageEditorProps = {
    clientMessage: string;
    disclaimer: string;
    onClientMessageChange: (value: string) => void;
    onDisclaimerChange: (value: string) => void;
    onSave: () => void;
};

export function QuoteClientMessageEditor({
    clientMessage,
    disclaimer,
    onClientMessageChange,
    onDisclaimerChange,
    onSave,
}: QuoteClientMessageEditorProps) {
    const [editingClientMessage, setEditingClientMessage] = useState(false);
    const [editingDisclaimer, setEditingDisclaimer] = useState(false);

    return (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Client Communication</h2>
            <div className="mt-4 space-y-6">
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Client Message
                        </label>
                        <button
                            type="button"
                            onClick={() => setEditingClientMessage(!editingClientMessage)}
                            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                    {editingClientMessage ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={clientMessage}
                                onChange={(event) => onClientMessageChange(event.target.value)}
                                rows={6}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Share a friendly note with the homeowner"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingClientMessage(false);
                                        onSave();
                                    }}
                                    className="cursor-pointer rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingClientMessage(false)}
                                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{clientMessage}</p>
                    )}
                </div>
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Terms & Disclaimer
                        </label>
                        <button
                            type="button"
                            onClick={() => setEditingDisclaimer(!editingDisclaimer)}
                            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                    {editingDisclaimer ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={disclaimer}
                                onChange={(event) => onDisclaimerChange(event.target.value)}
                                rows={6}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Outline any terms, conditions, or disclaimers"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingDisclaimer(false);
                                        onSave();
                                    }}
                                    className="cursor-pointer rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingDisclaimer(false)}
                                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{disclaimer}</p>
                    )}
                </div>
            </div>
        </section>
    );
}
