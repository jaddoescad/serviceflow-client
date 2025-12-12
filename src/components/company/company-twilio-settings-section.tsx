"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { CompanySettingsRecord } from "@/types/company";
import type { TwilioNumber } from "@/types/twilio";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import {
  fetchTwilioNumbers,
  updateTwilioSettings,
  testTwilioConnection,
} from "@/services/twilio";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200";

type CompanyTwilioSettingsSectionProps = {
  companyId: string;
  initialSettings: CompanySettingsRecord;
};

export function CompanyTwilioSettingsSection({
  companyId,
  initialSettings,
}: CompanyTwilioSettingsSectionProps) {
  const supabase = useSupabaseBrowserClient();

  const [accountSid, setAccountSid] = useState(
    initialSettings.twilio_account_sid ?? ""
  );
  const [authToken, setAuthToken] = useState(
    initialSettings.twilio_auth_token ?? ""
  );
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(
    initialSettings.twilio_phone_number ?? ""
  );
  const [enabled, setEnabled] = useState(
    initialSettings.twilio_enabled ?? false
  );
  const [phoneNumbers, setPhoneNumbers] = useState<TwilioNumber[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "untested" | "valid" | "invalid"
  >(
    initialSettings.twilio_account_sid && initialSettings.twilio_auth_token
      ? "untested"
      : "untested"
  );

  useEffect(() => {
    if (initialSettings.twilio_account_sid && initialSettings.twilio_auth_token) {
      loadPhoneNumbers(
        initialSettings.twilio_account_sid,
        initialSettings.twilio_auth_token
      );
    }
  }, [initialSettings.twilio_account_sid, initialSettings.twilio_auth_token]);

  const loadPhoneNumbers = async (sid: string, token: string) => {
    if (!sid.trim() || !token.trim()) return;

    setIsLoadingNumbers(true);
    setError(null);

    try {
      const numbers = await fetchTwilioNumbers(supabase, companyId, sid, token);
      setPhoneNumbers(numbers);
      setConnectionStatus("valid");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load phone numbers from Twilio."
      );
      setPhoneNumbers([]);
      setConnectionStatus("invalid");
    } finally {
      setIsLoadingNumbers(false);
    }
  };

  const handleTestConnection = async () => {
    if (!accountSid.trim() || !authToken.trim()) {
      setError("Please enter both Account SID and Auth Token first.");
      return;
    }

    setIsTesting(true);
    setError(null);
    setSuccess(null);

    try {
      await testTwilioConnection(supabase, companyId, accountSid, authToken);
      setConnectionStatus("valid");
      setSuccess("Connection successful! Loading phone numbers...");
      await loadPhoneNumbers(accountSid, authToken);
    } catch (err) {
      setConnectionStatus("invalid");
      setError(err instanceof Error ? err.message : "Failed to test connection.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload = {
        twilio_account_sid: accountSid.trim() || null,
        twilio_auth_token: authToken.trim() || null,
        twilio_phone_number: selectedPhoneNumber.trim() || null,
        twilio_enabled:
          enabled &&
          !!accountSid.trim() &&
          !!authToken.trim() &&
          !!selectedPhoneNumber.trim(),
      };

      try {
        await updateTwilioSettings(supabase, companyId, payload);
        setSuccess("Twilio settings saved successfully.");
        window.location.reload();
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Failed to update Twilio settings."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [supabase, companyId, accountSid, authToken, selectedPhoneNumber, enabled]
  );

  const resetForm = () => {
    setAccountSid(initialSettings.twilio_account_sid ?? "");
    setAuthToken(initialSettings.twilio_auth_token ?? "");
    setSelectedPhoneNumber(initialSettings.twilio_phone_number ?? "");
    setEnabled(initialSettings.twilio_enabled ?? false);
    setError(null);
    setSuccess(null);
    setConnectionStatus(
      initialSettings.twilio_account_sid && initialSettings.twilio_auth_token
        ? "untested"
        : "untested"
    );
  };

  return (
    <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Twilio Integration</h2>
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              connectionStatus === "valid"
                ? "bg-emerald-100 text-emerald-700"
                : connectionStatus === "invalid"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {connectionStatus === "valid"
              ? "Connected"
              : connectionStatus === "invalid"
                ? "Disconnected"
                : "Not Configured"}
          </span>
        </div>
        <p className="text-[12px] text-slate-600">
          Connect your Twilio account to send SMS from ServiceFlow.
        </p>
      </div>

      <section className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="accountSid">
            Twilio Account SID
          </label>
          <input
            id="accountSid"
            type="text"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className={inputClass}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="authToken">
            Twilio Auth Token
          </label>
          <div className="flex gap-2">
            <input
              id="authToken"
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Enter your Twilio auth token"
              className={inputClass}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={
                isTesting ||
                isLoadingNumbers ||
                !accountSid.trim() ||
                !authToken.trim()
              }
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {isTesting ? "Testing..." : "Test"}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Find credentials in{" "}
            <a
              href="https://console.twilio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Twilio Console
            </a>
            .
          </p>
        </div>
      </section>

      {phoneNumbers.length > 0 && (
        <section className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="phoneNumber">
              Select Phone Number
            </label>
            <select
              id="phoneNumber"
              value={selectedPhoneNumber}
              onChange={(e) => setSelectedPhoneNumber(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            >
              <option value="">-- Select a phone number --</option>
              {phoneNumbers.map((number) => (
                <option key={number.id} value={number.formattedNumber}>
                  {number.formattedNumber}
                  {number.name ? ` (${number.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {phoneNumbers.length > 0 && selectedPhoneNumber && (
        <section className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              disabled={isSubmitting}
            />
            <span className="text-[13px] font-medium text-slate-700">
              Enable Twilio integration
            </span>
          </label>
          <p className="text-[11px] text-slate-500">
            When enabled, SMS will be sent from your selected Twilio number.
          </p>
        </section>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-[13px] font-medium text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
          <p className="text-[13px] font-medium text-green-600">{success}</p>
        </div>
      )}

      {isLoadingNumbers && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
          <p className="text-[13px] font-medium text-blue-600">
            Loading phone numbers from Twilio...
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={isSubmitting || !accountSid.trim() || !authToken.trim()}
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Settings"}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
        >
          Reset
        </button>
      </div>

      <section className="space-y-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
        <h3 className="text-[12px] font-semibold text-slate-900">Need Help?</h3>
        <ul className="space-y-1 text-[11px] text-slate-600">
          <li>1. Copy Account SID and Auth Token from Twilio Console</li>
          <li>2. Click &quot;Test&quot; to verify the connection</li>
          <li>3. Select a phone number from the dropdown</li>
          <li>4. Enable the integration and save</li>
        </ul>
      </section>
    </form>
  );
}

