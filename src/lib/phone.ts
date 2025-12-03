export const formatPhoneToE164 = (phone: string | null): string | null => {
  if (!phone) return null;
  // Basic cleanup for demo
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `+1${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
  return phone; // Return as is if unsure
};
