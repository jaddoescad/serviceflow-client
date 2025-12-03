import { apiClient } from "@/services/api";
import type { QuoteRecord } from "@/types/quotes";

export const loadQuoteShareSnapshot = async (shareId: string) => {
    try {
        const data = await apiClient<any>(`/quotes/share/${shareId}`);
        return data;
    } catch (error) {
        console.error("Failed to load quote share", error);
        return null;
    }
};