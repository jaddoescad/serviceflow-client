import { useEffect, useState } from "react";
import type { PlaceSuggestion } from "@/types/google-places";
import {
  fetchPlaceAddressDetails,
  fetchPlaceSuggestions,
  isGoogleMapsConfigured,
} from "@/lib/google-places";
import type { AddressFormState } from "../types";

type UseAddressSuggestionsProps = {
  open: boolean;
  addressLine1: string;
  selectedAddressId: string | "new";
  onAddressUpdate: (updates: Partial<AddressFormState>) => void;
};

export function useAddressSuggestions({
  open,
  addressLine1,
  selectedAddressId,
  onAddressUpdate,
}: UseAddressSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const placesEnabled = isGoogleMapsConfigured();

  // Fetch suggestions when address line 1 changes
  useEffect(() => {
    if (!open || !placesEnabled || selectedAddressId !== "new") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = addressLine1.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsFetching(true);
      try {
        const results = await fetchPlaceSuggestions(query, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          console.error("Failed to fetch address suggestions", fetchError);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        setIsFetching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [addressLine1, open, placesEnabled, selectedAddressId]);

  const handleSuggestionSelect = async (suggestion: PlaceSuggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      setIsFetching(true);
      const details = await fetchPlaceAddressDetails(suggestion.placeId);

      onAddressUpdate({
        addressLine1: details?.street ?? suggestion.description,
        city: details?.city,
        state: details?.state,
        postalCode: details?.postalCode,
      });
    } catch (detailsError) {
      console.error("Failed to fetch address details", detailsError);
      onAddressUpdate({
        addressLine1: suggestion.description,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddressBlur = () => {
    window.setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleAddressFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return {
    suggestions,
    isFetching,
    showSuggestions,
    setShowSuggestions,
    placesEnabled,
    handleSuggestionSelect,
    handleAddressBlur,
    handleAddressFocus,
  };
}
