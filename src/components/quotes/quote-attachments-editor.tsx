import type { ChangeEvent } from "react";
import { formatByteSize } from "@/lib/attachments";
import type { ProposalAttachmentAsset } from "@/types/proposal-attachments";

type QuoteAttachmentsEditorProps = {
    quoteId?: string;
    attachments: ProposalAttachmentAsset[];
    pendingUploads: Array<{ id: string; previewUrl: string; fileName: string }>;
    imageAttachments: ProposalAttachmentAsset[];
    attachmentsError: string | null;
    isUploadingAttachment: boolean;
    deletingAttachmentId: string | null;
    activeAttachmentIndex: number | null;
    onAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onAttachmentDelete: (attachment: ProposalAttachmentAsset) => void;
    onOpenAttachment: (index: number) => void;
    onCloseAttachment: () => void;
    onStepAttachment: (direction: -1 | 1) => void;
};

export function QuoteAttachmentsEditor({
    quoteId,
    attachments,
    pendingUploads,
    imageAttachments,
    attachmentsError,
    isUploadingAttachment,
    deletingAttachmentId,
    activeAttachmentIndex,
    onAttachmentInputChange,
    onAttachmentDelete,
    onOpenAttachment,
    onCloseAttachment,
    onStepAttachment,
}: QuoteAttachmentsEditorProps) {
    return (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-slate-900">Attachments</h2>
                <p className="text-sm text-slate-600">
                    Upload project photos to include with this quote. We&apos;ll generate a thumbnail automatically for quick previews.
                </p>
            </div>

            {attachmentsError ? (
                <p className="mt-3 text-[12px] font-medium text-rose-600">{attachmentsError}</p>
            ) : null}

            <div className="mt-4">
                <label
                    className={`group relative block cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${!quoteId
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={!quoteId || isUploadingAttachment}
                        onChange={onAttachmentInputChange}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                        <svg
                            className={`h-10 w-10 ${!quoteId ? "text-slate-400" : "text-slate-400 group-hover:text-blue-500"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="text-sm font-medium text-slate-700">
                            {quoteId ? (
                                <>
                                    <span className="text-blue-600 group-hover:text-blue-700">Click to upload</span> or drag images here
                                </>
                            ) : (
                                "Save this quote before uploading attachments"
                            )}
                        </p>
                        <p className="text-xs text-slate-500">JPEG or PNG up to 10MB</p>
                        {isUploadingAttachment ? (
                            <p className="text-xs font-medium text-blue-600">Uploading…</p>
                        ) : null}
                    </div>
                </label>
            </div>

            {pendingUploads.length > 0 || imageAttachments.length > 0 ? (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {pendingUploads.map((pending) => (
                        <div
                            key={`pending-${pending.id}`}
                            className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                        >
                            <div className="relative h-32 w-full overflow-hidden">
                                <img
                                    src={pending.previewUrl}
                                    alt={pending.fileName}
                                    width="320"
                                    height="240"
                                    className="h-full w-full object-cover opacity-70"
                                />
                                <div className="absolute inset-0 bg-slate-900/30" />
                                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/80 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg
                                        className="h-6 w-6 animate-spin text-white"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                                        <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="px-3 py-2">
                                <p className="truncate text-[12px] font-medium text-slate-900" title={pending.fileName}>
                                    {pending.fileName}
                                </p>
                                <p className="text-[11px] text-slate-500">Uploading…</p>
                            </div>
                        </div>
                    ))}
                    {imageAttachments.map((attachment, index) => (
                        <div
                            key={attachment.id}
                            className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                        >
                            <button
                                type="button"
                                onClick={() => onOpenAttachment(index)}
                                className="relative block h-32 w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <img
                                    src={attachment.thumbnail_url ?? attachment.signed_url}
                                    alt={attachment.original_filename}
                                    width="320"
                                    height="240"
                                    className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                                />
                            </button>
                            <div className="flex items-start justify-between gap-2 px-3 py-2">
                                <div className="min-w-0">
                                    <p className="truncate text-[12px] font-medium text-slate-900" title={attachment.original_filename}>
                                        {attachment.original_filename}
                                    </p>
                                    <p className="text-[11px] text-slate-500">{formatByteSize(attachment.byte_size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onAttachmentDelete(attachment)}
                                    disabled={deletingAttachmentId === attachment.id}
                                    className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    aria-label="Delete attachment"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-[12px] text-slate-500">No images uploaded yet.</p>
            )}

            {activeAttachmentIndex !== null && imageAttachments[activeAttachmentIndex] ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <button
                        type="button"
                        onClick={onCloseAttachment}
                        className="absolute right-6 top-6 rounded-full bg-black/70 p-2 text-white transition hover:bg-black/60"
                        aria-label="Close attachment preview"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    {imageAttachments.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={() => onStepAttachment(-1)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white transition hover:bg-black/60"
                                aria-label="Previous image"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12.5 4.5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => onStepAttachment(1)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white transition hover:bg-black/60"
                                aria-label="Next image"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M7.5 4.5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </>
                    ) : null}
                    <div className="max-h-full max-w-4xl">
                        <img
                            src={imageAttachments[activeAttachmentIndex].signed_url}
                            alt={imageAttachments[activeAttachmentIndex].original_filename}
                            width="1600"
                            height="1200"
                            className="max-h-[80vh] w-full rounded-lg object-contain shadow-2xl"
                        />
                        <div className="mt-4 text-center text-sm text-white">
                            {imageAttachments[activeAttachmentIndex].original_filename}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
