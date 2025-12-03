import type { DealAttachmentRecord, DealDetailSnapshot } from "@/types/deal-details";

type DealAttachmentsPanelProps = Pick<DealDetailSnapshot, "attachments"> & {
  className?: string;
};

type AttachmentThumbnailProps = {
  attachment: DealAttachmentRecord;
};

function AttachmentThumbnail({ attachment }: AttachmentThumbnailProps) {
  const displayUrl =
    attachment.type === "image" ? attachment.thumbnail_url ?? attachment.url : null;

  if (displayUrl) {
    return (
      <img
        src={displayUrl}
        alt={attachment.filename}
        width="400"
        height="240"
        className="h-32 w-full rounded-md object-cover"
      />
    );
  }

  return (
    <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {attachment.type}
    </div>
  );
}

export function DealAttachmentsPanel({ attachments, className }: DealAttachmentsPanelProps) {
  return (
    <section
      className={`flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <header className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Attachments</h3>
      </header>
      {attachments.length === 0 ? (
        <p className="mt-6 text-center text-[12px] text-slate-500">No attachments yet.</p>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="flex flex-wrap gap-3">
            {attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full sm:w-52 flex-col gap-2"
              >
                <AttachmentThumbnail attachment={attachment} />
                <span className="sr-only">
                  {attachment.type === "image" ? "Image attachment" : attachment.filename}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
