import { apiClient } from "@/services/api";
import type { ProposalListRow, ProposalListSummary } from "@/types/proposals-list";
import type { QuoteRecord } from "@/types/quotes";
import type { DealRecord } from "@/features/deals";

const summarizeLineItems = (quote: QuoteRecord): number => {
  const items = Array.isArray(quote.line_items) ? quote.line_items : [];
  return items.reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0);
    const price = Number(item?.unit_price ?? 0);
    return sum + qty * price;
  }, 0);
};

const formatAddress = (deal: DealRecord | undefined): string | null => {
  const address = deal?.service_address;
  if (!address) return null;
  const parts = [
    address.address_line1,
    address.address_line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : null;
};

const buildCustomerName = (deal: DealRecord | undefined): string => {
  if (!deal) return "Unknown";
  const contactName = `${deal.contact?.first_name ?? deal.first_name ?? ""} ${deal.contact?.last_name ?? deal.last_name ?? ""}`.trim();
  if (contactName) return contactName;
  if (deal.email) return deal.email;
  if (deal.phone) return deal.phone;
  return "Unknown";
};

export const fetchProposalListData = async (
  companyId: string,
  _options?: { salespersonName?: string | null }
) => {
  const [quotes, deals] = await Promise.all([
    apiClient<QuoteRecord[]>("/quotes", { params: { company_id: companyId } }).catch((error) => {
      console.error("Failed to load quotes", error);
      return [] as QuoteRecord[];
    }),
    apiClient<DealRecord[]>("/deals", { params: { company_id: companyId } }).catch((error) => {
      console.error("Failed to load deals for proposals", error);
      return [] as DealRecord[];
    }),
  ]);

  const dealById = new Map<string, DealRecord>();
  deals.forEach((deal) => dealById.set(deal.id, deal));

  const rows: ProposalListRow[] = quotes.map((quote) => {
    const deal = dealById.get(quote.deal_id);
    const customerName = buildCustomerName(deal);
    const dealName = customerName ? `${customerName} Deal` : "Deal";
    const jobAddress = formatAddress(deal);
    const amount = summarizeLineItems(quote);

    return {
      id: quote.id,
      dealId: quote.deal_id,
      status: quote.status,
      customerName,
      dealName,
      title: quote.title || quote.quote_number,
      quoteNumber: quote.quote_number,
      jobAddress,
      amount,
      createdAt: quote.created_at,
    };
  });

  const summary: ProposalListSummary = {
    statuses: Array.from(new Set(rows.map((row) => row.status))),
    totalProposals: rows.length,
  };

  return { rows, summary };
};
