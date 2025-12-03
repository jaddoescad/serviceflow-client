"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppointmentCalendarEvent } from "@/types/appointments";
import { createSupabaseBrowserClient } from "@/supabase/clients/browser";
import { apiClient, API_BASE_URL } from "@/services/api";

type GoogleCalendarIntegrationProps = {
  monthLabel: string;
  events: AppointmentCalendarEvent[];
};

type SyncState = "idle" | "checking" | "connected" | "disconnected";

export function GoogleCalendarIntegration({ events }: GoogleCalendarIntegrationProps) {
  const [connectionState, setConnectionState] = useState<SyncState>("checking");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const syncableEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          Boolean(event.scheduledStart && event.scheduledEnd) &&
          Number.isFinite(new Date(event.scheduledStart).valueOf()) &&
          Number.isFinite(new Date(event.scheduledEnd).valueOf())
      ),
    [events]
  );
  const isConnected = connectionState === "connected";
  const hasEvents = syncableEvents.length > 0;
  const isChecking = connectionState === "checking";

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const fetchConnection = async () => {
      setConnectionState("checking");
      try {
        const data = await apiClient<{ connected: boolean; expiresAt: string | null }>("/google-calendar/connection");
        if (cancelled) return;
        setConnectionState(data.connected ? "connected" : "disconnected");
      } catch (error: any) {
        if (cancelled) return;

        // Handle specific error cases
        if (error.message?.includes("not configured")) {
          setIsUnavailable(true);
          setConnectionState("disconnected");
          setErrorMessage(error.message || "Google Calendar is not configured.");
        } else if (error.message?.includes("Unauthorized")) {
          setConnectionState("disconnected");
        } else {
          setConnectionState("disconnected");
          setErrorMessage("Unable to check Google Calendar connection.");
        }
      }
    };

    fetchConnection();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleConnect = () => {
    if (isUnavailable) {
      setErrorMessage("Google Calendar is not configured yet.");
      return;
    }
    const redirectTo = `${window.location.pathname}${window.location.search}`;
    const url = `${API_BASE_URL}/google-calendar/auth?redirectTo=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  };

  const handleDisconnect = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await apiClient("/google-calendar/disconnect", { method: "POST" });
      setStatusMessage("Disconnected from Google Calendar.");
      setConnectionState("disconnected");
    } catch (error) {
      setErrorMessage("Failed to disconnect Google Calendar.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <button
          type="button"
          onClick={handleDisconnect}
          className="inline-flex items-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
        >
          Disconnect Google
        </button>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={isChecking || isUnavailable}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isChecking ? "Checking..." : "Sync to Google Calendar"}
        </button>
      )}
      <p className="text-[11px] text-slate-500">
        {isUnavailable
          ? "Google Calendar isn’t configured yet."
          : isChecking
            ? "Checking connection..."
            : isConnected
              ? hasEvents
                ? "New or updated appointments push automatically."
                : "Connected. Add appointments to sync."
              : "Connect to push your appointments to Google."}
      </p>
      {statusMessage ? <span className="text-[11px] text-emerald-600">{statusMessage}</span> : null}
      {errorMessage ? <span className="text-[11px] text-rose-600">{errorMessage}</span> : null}
    </div>
  );
}
