import type { SupabaseBrowserClient } from "@/supabase/clients/browser";
import type { ScheduleDripsPayload, ScheduleDripsResult } from "@/types/drips";

export const scheduleDealDrips = async (
  supabase: SupabaseBrowserClient,
  data: ScheduleDripsPayload
): Promise<ScheduleDripsResult> => {
  const { data: result, error } = await supabase.functions.invoke("schedule-drips", {
    body: data,
  });

  if (error) {
    throw new Error(error.message || "Failed to schedule drips.");
  }

  return (result as ScheduleDripsResult) ?? {
    scheduledCount: 0,
    cancelledCount: 0,
    sequenceId: null,
  };
};
