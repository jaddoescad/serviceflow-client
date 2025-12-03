import type { CompanyMemberRecord } from "@/types/company-members";
import type { DealRecord } from "@/features/deals";

export const filterDealsForMember = (
  deals: DealRecord[],
  member: Pick<CompanyMemberRecord, "id" | "role"> | null | undefined
) => {
  if (!member || member.role === "admin") {
    return deals;
  }

  return deals.filter((deal) => deal.assigned_to === member.id);
};

export const dealMatchesDisplayName = (deal: DealRecord, query: string) => {
  const name = `${deal.first_name} ${deal.last_name}`.toLowerCase();
  return name.includes(query.toLowerCase());
};
