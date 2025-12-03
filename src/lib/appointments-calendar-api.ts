import { API_BASE_URL } from "@/services/api";
import { createSupabaseBrowserClient } from "@/supabase/clients/browser";
import type { AppointmentCalendarResponse } from "@/types/appointments";
import type { MonthRange } from "@/lib/calendar-month";

export const requestCalendarAppointments = async (
    range: MonthRange,
    scope: "appointments" | "jobs",
    companyId?: string
): Promise<{
    response: Response;
    data: AppointmentCalendarResponse | null;
}> => {
    try {
        const url = new URL("/appointments", API_BASE_URL);

        url.searchParams.set("start", range.startInclusive.toISOString());
        url.searchParams.set("end", range.endExclusive.toISOString());
        url.searchParams.set("scope", scope);
        if (companyId) {
            url.searchParams.set("company_id", companyId);
        }

        // Get the access token from Supabase session
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(url.toString(), {
            headers,
            cache: "no-store",
        });

        if (!response.ok) {
            return { response, data: null as AppointmentCalendarResponse | null };
        }

        const appointments = await response.json();

        return {
            response,
            data: { appointments } satisfies AppointmentCalendarResponse,
        };
    } catch (error) {
        const response = new Response(null, {
            statusText: "Failed to load calendar appointments",
            status: 500,
        });
        return { response, data: null as AppointmentCalendarResponse | null };
    }
};
