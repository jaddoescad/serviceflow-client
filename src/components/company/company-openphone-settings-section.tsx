"use client";

import { FormEvent, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CompanySettingsRecord } from "@/types/company";
import type { OpenPhoneNumber } from "@/types/openphone";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import {
  fetchOpenPhoneNumbers,
  updateOpenPhoneSettings,
  testOpenPhoneConnection,
} from "@/services/openphone";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200";

type CompanyOpenPhoneSettingsSectionProps = {
  companyId: string;
  initialSettings: CompanySettingsRecord;
};

export function CompanyOpenPhoneSettingsSection({
  companyId,
  initialSettings,
}: CompanyOpenPhoneSettingsSectionProps) {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState(initialSettings.openphone_api_key ?? "");
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState(
    initialSettings.openphone_phone_number_id ?? ""
  );
  const [enabled, setEnabled] = useState(initialSettings.openphone_enabled ?? false);
  const [phoneNumbers, setPhoneNumbers] = useState<OpenPhoneNumber[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "untested" | "valid" | "invalid"
  >(initialSettings.openphone_api_key ? "untested" : "untested");

  // Load phone numbers when component mounts if API key exists
  useEffect(() => {
    if (initialSettings.openphone_api_key) {
      loadPhoneNumbers(initialSettings.openphone_api_key);
    }
  }, [initialSettings.openphone_api_key]);

  const loadPhoneNumbers = async (key: string) => {
    if (!key.trim()) return;

    setIsLoadingNumbers(true);
    setError(null);

    try {
      const numbers = await fetchOpenPhoneNumbers(supabase, companyId, key);
      setPhoneNumbers(numbers);
      setConnectionStatus("valid");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load phone numbers from OpenPhone."
      );
      setPhoneNumbers([]);
      setConnectionStatus("invalid");
    } finally {
      setIsLoadingNumbers(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key first.");
      return;
    }

    setIsTesting(true);
    setError(null);
    setSuccess(null);

    try {
      await testOpenPhoneConnection(supabase, companyId, apiKey);
      setConnectionStatus("valid");
      setSuccess("Connection successful! Loading phone numbers...");
      await loadPhoneNumbers(apiKey);
    } catch (err) {
      setConnectionStatus("invalid");
      setError(
        err instanceof Error ? err.message : "Failed to test connection."
      );
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

      // Find the selected phone number
      const selectedNumber = phoneNumbers.find(
        (num) => num.id === selectedPhoneNumberId
      );

      const payload = {
        openphone_api_key: apiKey.trim() || null,
        openphone_phone_number_id: selectedPhoneNumberId || null,
        openphone_phone_number: selectedNumber?.formattedNumber || null,
        openphone_enabled: enabled && !!apiKey.trim() && !!selectedPhoneNumberId,
      };

      try {
        await updateOpenPhoneSettings(supabase, companyId, payload);
        setSuccess("OpenPhone settings saved successfully.");
        window.location.reload();
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Failed to update OpenPhone settings."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [supabase, companyId, apiKey, selectedPhoneNumberId, enabled, phoneNumbers, router]
  );

  const resetForm = () => {
    setApiKey(initialSettings.openphone_api_key ?? "");
    setSelectedPhoneNumberId(initialSettings.openphone_phone_number_id ?? "");
    setEnabled(initialSettings.openphone_enabled ?? false);
    setError(null);
    setSuccess(null);
    setConnectionStatus(initialSettings.openphone_api_key ? "untested" : "untested");
  };

  return (
    <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">OpenPhone Integration</h2>
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${connectionStatus === "valid"
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
          Integrate your OpenPhone account to make calls and send SMS directly from ServiceFlow.
        </p>
      </div>

      {/* API Key Section */}
      <section className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="apiKey">
            OpenPhone API Key
          </label>
          <div className="flex gap-2">
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenPhone API key"
              className={inputClass}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || isLoadingNumbers || !apiKey.trim()}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-1.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {isTesting ? "Testing..." : "Test"}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Get your API key from{" "}
            <a
              href="https://app.openphone.com/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenPhone Settings
            </a>
          </p>
        </div>
      </section>

      {/* Phone Number Selection */}
      {phoneNumbers.length > 0 && (
        <section className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="phoneNumber">
              Select Phone Number
            </label>
            <select
              id="phoneNumber"
              value={selectedPhoneNumberId}
              onChange={(e) => setSelectedPhoneNumberId(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            >
              <option value="">-- Select a phone number --</option>
              {phoneNumbers.map((number) => (
                <option key={number.id} value={number.id}>
                  {number.formattedNumber}
                  {number.name ? ` (${number.name})` : ""}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* Enable/Disable Toggle */}
      {phoneNumbers.length > 0 && selectedPhoneNumberId && (
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
              Enable OpenPhone integration
            </span>
          </label>
          <p className="text-[11px] text-slate-500">
            When enabled, you can make calls and send SMS using your OpenPhone number.
          </p>
        </section>
      )}

      {/* Messages */}
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

      {/* Loading State */}
      {isLoadingNumbers && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
          <p className="text-[13px] font-medium text-blue-600">
            Loading phone numbers from OpenPhone...
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={isSubmitting || !apiKey.trim()}
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

      {/* Help Section */}
      <section className="space-y-2 rounded-lg bg-slate-50 border border-slate-200 p-4">
        <h3 className="text-[12px] font-semibold text-slate-900">Need Help?</h3>
        <ul className="space-y-1 text-[11px] text-slate-600">
          <li>1. Get your API key from OpenPhone Settings</li>
          <li>2. Enter the API key and click &quot;Test&quot; to verify the connection</li>
          <li>3. Select a phone number from the dropdown</li>
          <li>4. Enable the integration and save</li>
        </ul>
      </section>
    </form>
  );
}
