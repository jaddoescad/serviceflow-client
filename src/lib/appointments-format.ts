export const isAppointmentTomorrow = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

export const formatAppointmentDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatAppointmentDateDetail = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString();
};

export const formatAppointmentStartTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatAppointmentTimeRange = (start: string, end: string): string => {
    return `${formatAppointmentStartTime(start)} - ${formatAppointmentStartTime(end)}`;
};

export const formatDealServiceAddress = (dealOrAddress: any): string => {
    const addr = dealOrAddress?.service_address ?? dealOrAddress;

    if (!addr) {
        return "Address unavailable";
    }

    const parts = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.postal_code]
        .map((part?: string | null) => part?.trim())
        .filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Address unavailable";
};
