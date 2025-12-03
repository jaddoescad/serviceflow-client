import type { DealChatMessage } from "@/types/deal-details";

export type ChatMessageBubbleProps = {
  message: DealChatMessage;
  isFirstOfDay: boolean;
};

export function ChatMessageBubble({ message, isFirstOfDay }: ChatMessageBubbleProps) {
  const isTeam = message.author_type === "team";
  const initials = extractInitials(message.author_name);
  const formattedTime = formatTimestamp(message.sent_at);

  return (
    <div className="flex flex-col gap-2">
      {isFirstOfDay ? (
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          {new Date(message.sent_at).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      ) : null}

      <div className={`flex w-full gap-3 ${isTeam ? "flex-row-reverse" : "flex-row"}`}>
        <span
          className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold uppercase ${
            isTeam ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {initials}
        </span>

        <div
          className={`flex max-w-[420px] flex-col gap-2 rounded-2xl px-4 py-3 text-[13px] leading-5 shadow-sm ${
            isTeam ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-800"
          }`}
        >
          <header
            className={`flex flex-wrap items-center gap-2 text-[11px] ${isTeam ? "text-slate-200" : "text-slate-500"}`}
          >
            <span className={`font-semibold ${isTeam ? "text-white" : "text-slate-900"}`}>{message.author_name}</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-50" aria-hidden />
            <span>{formattedTime}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isTeam ? "bg-white/15 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {message.author_type === "team" ? "Team" : "Client"}
            </span>
          </header>
          <p>{message.body}</p>
          {message.attachments?.length ? (
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((attachment) => {
                if (attachment.type === "image") {
                  return (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block overflow-hidden rounded-lg"
                    >
                      <img
                        src={attachment.thumbnail_url ?? attachment.url}
                        alt={attachment.filename}
                        width="220"
                        height="160"
                        className="h-32 w-40 object-cover transition group-hover:brightness-105"
                      />
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-[10px] text-white">
                        {attachment.filename}
                      </span>
                    </a>
                  );
                }

                return (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[12px] transition ${
                      isTeam
                        ? "border-white/20 text-slate-100 hover:border-white hover:text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current/60" aria-hidden />
                    {attachment.filename}
                  </a>
                );
              })}
            </div>
          ) : message.pending_attachments ? (
            <div className="flex flex-wrap gap-2">
              <div className="flex h-32 w-40 animate-pulse items-center justify-center rounded-lg bg-slate-200 text-[11px] text-slate-500">
                Loading image…
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function isFirstMessageOfDay(index: number, messages: DealChatMessage[]) {
  if (index === 0) return true;
  const current = new Date(messages[index].sent_at);
  const previous = new Date(messages[index - 1].sent_at);
  return current.toDateString() !== previous.toDateString();
}

function extractInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0)?.toUpperCase())
    .join("")
    .padEnd(2, "");
}

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" });
}
