"use client";

import { useEffect, useMemo, useState } from "react";
import type { DealEmailMessage } from "@/types/deal-details";
import type { SmsChatThread } from "@/types/sms";
import { mapSmsRecordsToDealChatMessages } from "@/lib/sms-normalizer";
import {
  ChatMessageBubble,
  isFirstMessageOfDay,
} from "@/components/communications/chat-message-bubble";

type ThreadTab = "chat" | "email";

export type SmsChatThreadWithEmails = SmsChatThread & {
  emails: DealEmailMessage[];
};

export type SmsChatBrowserProps = {
  threads: SmsChatThreadWithEmails[];
};

export function SmsChatBrowser({ threads }: SmsChatBrowserProps) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => threads[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<ThreadTab>("chat");

  useEffect(() => {
    if (!threads.length) {
      setActiveThreadId(null);
      return;
    }

    if (!activeThreadId || !threads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(threads[0]?.id ?? null);
    }
  }, [threads, activeThreadId]);

  useEffect(() => {
    setActiveTab("chat");
  }, [activeThreadId]);

  const activeThread = useMemo(() => {
    if (!threads.length) {
      return null;
    }

    const selected = threads.find((thread) => thread.id === activeThreadId);
    return selected ?? threads[0];
  }, [activeThreadId, threads]);

  const messages = useMemo(() => {
    if (!activeThread) {
      return [];
    }

    return mapSmsRecordsToDealChatMessages(activeThread.messages, activeThread.contactDisplayName);
  }, [activeThread]);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 rounded-lg border border-slate-200 bg-white shadow-sm lg:w-80">
        <header className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Chats</h2>
          <p className="text-[11px] text-slate-400">{threads.length} conversation{threads.length === 1 ? "" : "s"}</p>
        </header>
        {threads.length ? (
          <ul className="max-h-[calc(100vh-13rem)] divide-y divide-slate-100 overflow-y-auto">
            {threads.map((thread) => (
              <li key={thread.id}>
                <ThreadListItem
                  thread={thread}
                  isActive={activeThread?.id === thread.id}
                  onSelect={() => setActiveThreadId(thread.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-48 items-center justify-center px-4 text-center text-[12px] text-slate-500">
            No SMS chats yet. Conversations appear here once messages are exchanged.
          </div>
        )}
      </aside>

      <section className="flex flex-1 min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        {activeThread ? (
          <>
            <ThreadHeader
              thread={activeThread}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <div className="flex flex-1 min-h-0 flex-col">
              {activeTab === "chat" ? (
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 lg:px-6">
                  {messages.length ? (
                    messages.map((message, index) => (
                      <ChatMessageBubble
                        key={message.id}
                        message={message}
                        isFirstOfDay={isFirstMessageOfDay(index, messages)}
                      />
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-[12px] text-slate-500">
                      No messages in this conversation yet.
                    </div>
                  )}
                </div>
              ) : (
                <EmailThreadView
                  emails={activeThread.emails}
                  hasEmailAddresses={activeThread.participantEmails.length > 0}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[12px] text-slate-500">
            Select a conversation to view its messages.
          </div>
        )}
      </section>
    </div>
  );
}

type ThreadListItemProps = {
  thread: SmsChatThreadWithEmails;
  isActive: boolean;
  onSelect: () => void;
};

function ThreadListItem({ thread, isActive, onSelect }: ThreadListItemProps) {
  const lastMessageTime = thread.lastMessageAt ? formatListTimestamp(thread.lastMessageAt) : "";
  const preview = thread.lastMessageBody ? thread.lastMessageBody.slice(0, 80) : "";
  const direction = thread.lastMessageDirection;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition ${
        isActive ? "bg-slate-100" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-semibold text-slate-900">{thread.contactDisplayName}</p>
        {lastMessageTime ? <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">{lastMessageTime}</span> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {direction ? (
          <span className={`rounded-full px-2 py-0.5 ${direction === "inbound" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
            {direction === "inbound" ? "Inbound" : "Outbound"}
          </span>
        ) : null}
        {thread.dealLabel ? (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">{thread.dealLabel}</span>
        ) : null}
      </div>
      <p className="line-clamp-2 text-[12px] text-slate-500">{preview || "No recent messages."}</p>
    </button>
  );
}

type ThreadHeaderProps = {
  thread: SmsChatThreadWithEmails;
  activeTab: ThreadTab;
  onTabChange: (tab: ThreadTab) => void;
};

function ThreadHeader({ thread, activeTab, onTabChange }: ThreadHeaderProps) {
  const participantPhones = thread.participantPhones.length
    ? thread.participantPhones
    : thread.contactPhone
      ? [thread.contactPhone]
      : [];
  const formattedPhones = participantPhones.map((phone) => formatDisplayPhone(phone));
  const hasEmailAddresses = thread.participantEmails.length > 0;

  const buttons: { id: ThreadTab; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "email", label: "Email" },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="truncate text-[15px] font-semibold text-slate-900">{thread.contactDisplayName}</h2>
          <div className="flex gap-2">
            {buttons.map((button) => {
              const isActive = activeTab === button.id;
              return (
                <button
                  key={button.id}
                  type="button"
                  onClick={() => onTabChange(button.id)}
                  className={`flex items-center justify-center rounded-md border px-3 py-1.5 text-[12px] font-semibold transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {button.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          {formattedPhones.length ? (
            <span className="flex items-center gap-1">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Phones</span>
              <span className="text-slate-600">{formattedPhones.join(", ")}</span>
            </span>
          ) : (
            <span className="text-slate-400">No phone numbers available.</span>
          )}
          {hasEmailAddresses ? (
            <span className="flex items-center gap-1">
              <span className="font-semibold uppercase tracking-wide text-slate-400">Emails</span>
              <span className="text-slate-600">{thread.participantEmails.join(", ")}</span>
            </span>
          ) : null}
          {thread.dealLabel ? (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {thread.dealLabel}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

type EmailThreadViewProps = {
  emails: DealEmailMessage[];
  hasEmailAddresses: boolean;
};

function EmailThreadView({ emails, hasEmailAddresses }: EmailThreadViewProps) {
  if (!hasEmailAddresses) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] text-slate-500">
        Add an email address to the deal or contact to view email conversations here.
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] text-slate-500">
        No emails matched this conversation yet. New messages will appear automatically.
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
      {emails.map((email) => (
        <li key={email.id} className="space-y-1 px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[13px] font-semibold text-slate-900">
              {email.subject || "(No subject)"}
            </h3>
            <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-400">
              {formatEmailTimestamp(email.sent_at)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
            <span
              className={`rounded-full px-2 py-0.5 ${
                email.direction === "inbound"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {email.direction === "inbound" ? "Inbound" : "Outbound"}
            </span>
            <span className="text-slate-500 normal-case">
              {email.sender_name || email.sender_email}
            </span>
            {email.has_attachments ? (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">Attachments</span>
            ) : null}
          </div>
          <p className="line-clamp-3 text-[12px] text-slate-500">{email.preview}</p>
        </li>
      ))}
    </ul>
  );
}

function formatListTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (diffMs < oneDayMs) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatEmailTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D+/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4);
    const prefix = digits.slice(4, 7);
    const line = digits.slice(7);
    return `(${area}) ${prefix}-${line}`;
  }

  if (digits.length === 10) {
    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const line = digits.slice(6);
    return `(${area}) ${prefix}-${line}`;
  }

  return phone;
}
