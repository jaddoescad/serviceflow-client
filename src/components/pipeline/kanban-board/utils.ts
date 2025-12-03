import type { DealRecord, DealStageOption } from "@/features/deals";
import type { DealsByStage } from "./types";

export const buildColumns = (deals: DealRecord[], stageOptions: DealStageOption[]): DealsByStage => {
  const base: DealsByStage = stageOptions.reduce((acc, stage) => {
    acc[stage.id] = [];
    return acc;
  }, {} as DealsByStage);

  const defaultStageId = stageOptions[0]?.id ?? null;

  for (const deal of deals) {
    const stageId = stageOptions.find((item) => item.id === deal.stage)?.id ?? defaultStageId;

    if (!stageId) {
      continue;
    }

    base[stageId] = [...base[stageId], deal];
  }

  return base;
};

export const formatName = (deal: DealRecord) => {
  const source = deal.contact ?? deal;
  const name = `${source.first_name ?? ""} ${source.last_name ?? ""}`.trim();
  if (name) {
    return name;
  }
  return deal.email ?? deal.phone ?? "Unnamed contact";
};

export const formatLocation = (deal: DealRecord) => {
  const address = deal.service_address;

  if (!address) {
    return "Location not set";
  }

  const city = address.city?.trim() ?? "";
  const state = address.state?.trim() ?? "";

  if (city && state) {
    return `${city}, ${state}`;
  }

  if (city) {
    return city;
  }

  if (state) {
    return state;
  }

  return "Location not set";
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export const formatUpdatedAt = (value: string | null | undefined) => {
  if (!value) {
    return "Updated date unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Updated date unavailable";
  }

  const seconds = Math.round((parsed.getTime() - Date.now()) / 1000);

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: "year", seconds: 60 * 60 * 24 * 365 },
    { unit: "month", seconds: 60 * 60 * 24 * 30 },
    { unit: "week", seconds: 60 * 60 * 24 * 7 },
    { unit: "day", seconds: 60 * 60 * 24 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "minute", seconds: 60 },
  ];

  for (const item of units) {
    if (Math.abs(seconds) >= item.seconds) {
      const valueForUnit = Math.round(seconds / item.seconds);
      return `Updated ${relativeTimeFormatter.format(valueForUnit, item.unit)}`;
    }
  }

  return "Updated just now";
};
