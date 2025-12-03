const formatDateTime = (value: Date) =>
    value.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

type QuoteDetailsEditorProps = {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    propertyAddress: string;
    quoteNumber: string;
    createdAt: Date | null;
    lastSavedAt: Date | null;
    isSaving: boolean;
};

export function QuoteDetailsEditor({
    clientName,
    clientPhone,
    clientEmail,
    propertyAddress,
    quoteNumber,
    createdAt,
    lastSavedAt,
    isSaving,
}: QuoteDetailsEditorProps) {
    const createdAtLabel = createdAt ? formatDateTime(createdAt) : "Not yet created";
    const lastSavedLabel = lastSavedAt ? formatDateTime(lastSavedAt) : "Not yet saved";

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Client</p>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                                <p className="mt-1 text-slate-800">{clientName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                                <p className="mt-1 text-slate-800">{clientPhone || "Not provided"}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                                <p className="mt-1 text-slate-800">{clientEmail || "Not provided"}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service Address</p>
                                <p className="mt-1 text-slate-800">{propertyAddress || "No address provided"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quote Number</p>
                            <p className="mt-2 text-base font-semibold text-slate-900">{quoteNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Created</p>
                            <p className="mt-2 text-sm text-slate-600">{createdAtLabel}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Last Saved</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-600">{isSaving ? "Saving..." : lastSavedLabel}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
