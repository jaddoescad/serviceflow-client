import type { DripChannel, DripStepRecord } from "@/features/drips";
import {
  DRIP_CHANNEL_LABELS,
  DRIP_CHANNEL_ORDER,
  DRIP_DELAY_TYPE_LABELS,
  DRIP_DELAY_UNIT_LABELS,
  DRIP_DELAY_UNIT_ORDER,
} from "@/features/drips";
import { TemplateHintList } from "./TemplateHintList";
import type { DripStepFormProps } from "../types";

const channelIncludesEmail = (channel: DripChannel) => channel === "email" || channel === "both";
const channelIncludesSms = (channel: DripChannel) => channel === "sms" || channel === "both";

export function DripStepForm({
  step,
  isSaving,
  error,
  onStepChange,
  onSave,
}: DripStepFormProps) {
  const handleChannelChange = (nextChannel: DripChannel) => {
    onStepChange({
      channel: nextChannel,
      sms_body: channelIncludesSms(nextChannel) ? step.sms_body ?? "Hi {{first_name}}" : null,
    });
  };

  const handleDelayTypeChange = (nextType: DripStepRecord["delay_type"]) => {
    onStepChange({
      delay_type: nextType,
      delay_value: nextType === "immediate" ? 0 : step.delay_value || 10,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Channel
          </label>
          <select
            value={step.channel}
            onChange={(event) => handleChannelChange(event.target.value as DripChannel)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DRIP_CHANNEL_ORDER.map((channel) => (
              <option key={channel} value={channel}>
                {DRIP_CHANNEL_LABELS[channel]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Timing
          </label>
          <div className="mt-1 flex items-center gap-2">
            <select
              value={step.delay_type}
              onChange={(event) =>
                handleDelayTypeChange(event.target.value as DripStepRecord["delay_type"])
              }
              className="w-28 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(DRIP_DELAY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {step.delay_type === "after" ? (
              <>
                <input
                  type="number"
                  min={1}
                  value={step.delay_value}
                  onChange={(event) => {
                    const nextValue = Number.parseInt(event.target.value, 10) || 0;
                    onStepChange({ delay_value: Math.max(nextValue, 1) });
                  }}
                  className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={step.delay_unit}
                  onChange={(event) =>
                    onStepChange({ delay_unit: event.target.value as DripStepRecord["delay_unit"] })
                  }
                  className="w-28 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DRIP_DELAY_UNIT_ORDER.map((unit) => (
                    <option key={unit} value={unit}>
                      {DRIP_DELAY_UNIT_LABELS[unit]}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {channelIncludesEmail(step.channel) ? (
        <div className="space-y-2">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Email subject
            </label>
            <input
              type="text"
              value={step.email_subject ?? ""}
              onChange={(event) => onStepChange({ email_subject: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Email body
            </label>
            <textarea
              rows={4}
              value={step.email_body ?? ""}
              onChange={(event) => onStepChange({ email_body: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <TemplateHintList />
          </div>
        </div>
      ) : null}

      {channelIncludesSms(step.channel) ? (
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Text message
          </label>
          <textarea
            rows={3}
            value={step.sms_body ?? ""}
            onChange={(event) => onStepChange({ sms_body: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <TemplateHintList />
        </div>
      ) : null}

      {error ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </>
  );
}
