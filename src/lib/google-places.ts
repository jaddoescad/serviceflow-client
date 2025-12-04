import type { PlaceAddressDetails, PlaceSuggestion } from "@/types/google-places";
import { API_BASE_URL } from "@/services/api";

const SUGGESTIONS_API_PATH = `${API_BASE_URL}/google-places/suggestions`;
const DETAILS_API_PATH = `${API_BASE_URL}/google-places/details`;

type SuggestionsResponse = {
  suggestions?: PlaceSuggestion[];
  error?: string;
};

type DetailsResponse = {
  details?: PlaceAddressDetails | null;
  error?: string;
};

export const fetchPlaceSuggestions = async (
  input: string,
  signal?: AbortSignal
): Promise<PlaceSuggestion[]> => {
  const query = input.trim();
  if (!query) {
    return [];
  }

  const params = new URLSearchParams({ query });
  const response = await fetch(`${SUGGESTIONS_API_PATH}?${params.toString()}`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Failed to fetch place suggestions (${response.status})`;
    try {
      const payload = (await response.json()) as SuggestionsResponse;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // ignore JSON parse failure and use default message
    }
    throw new Error(message);
  }

  const payload: SuggestionsResponse = await response.json();
  return payload.suggestions ?? [];
};

export const fetchPlaceAddressDetails = async (
  placeId: string
): Promise<PlaceAddressDetails | null> => {
  const trimmedPlaceId = placeId.trim();
  if (!trimmedPlaceId) {
    return null;
  }

  const params = new URLSearchParams({ placeId: trimmedPlaceId });
  const response = await fetch(`${DETAILS_API_PATH}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Failed to fetch place details (${response.status})`;
    try {
      const payload = (await response.json()) as DetailsResponse;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // ignore JSON parse failure and use default message
    }
    throw new Error(message);
  }

  const payload: DetailsResponse = await response.json();
  return payload.details ?? null;
};
