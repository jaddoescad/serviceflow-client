type QuoteDetailsEditorProps = {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    propertyAddress: string;
};

export function QuoteDetailsEditor({
    clientName,
    clientPhone,
    clientEmail,
    propertyAddress,
}: QuoteDetailsEditorProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
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
        </section>
    );
}
