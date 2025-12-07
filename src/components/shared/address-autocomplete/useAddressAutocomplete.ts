import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaceSuggestion } from "@/types/google-places";
import {
  fetchPlaceAddressDetails,
  fetchPlaceSuggestions,
} from "@/lib/google-places";

export type AddressFormState = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const EMPTY_ADDRESS_FORM: AddressFormState = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

type UseAddressAutocompleteProps = {
  open: boolean;
  addressLine1: string;
  onAddressUpdate: (updates: Partial<AddressFormState>) => void;
};

export function useAddressAutocomplete({
  open,
  addressLine1,
  onAddressUpdate,
}: UseAddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Track if the user is actively typing vs. programmatic updates
  const isUserTypingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      setShowSuggestions(false);
      isUserTypingRef.current = false;
    }
  }, [open]);

  // Fetch suggestions when user types (not on programmatic updates)
  useEffect(() => {
    if (!open || !isUserTypingRef.current) {
      return;
    }

    const query = addressLine1.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
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
  }, [addressLine1, open]);

  // Handle click outside to close suggestions
  useEffect(() => {
    if (!showSuggestions) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    // Use mousedown to close before blur fires
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const handleSuggestionSelect = useCallback(
    async (suggestion: PlaceSuggestion) => {
      setShowSuggestions(false);
      setSuggestions([]);
      isUserTypingRef.current = false;

      try {
        setIsFetching(true);
        const details = await fetchPlaceAddressDetails(suggestion.placeId);

        onAddressUpdate({
          addressLine1: details?.street ?? suggestion.description,
          city: details?.city ?? undefined,
          state: details?.state ?? undefined,
          postalCode: details?.postalCode ?? undefined,
        });
      } catch (detailsError) {
        console.error("Failed to fetch address details", detailsError);
        onAddressUpdate({
          addressLine1: suggestion.description,
        });
      } finally {
        setIsFetching(false);
      }
    },
    [onAddressUpdate]
  );

  const handleAddressBlur = useCallback(() => {
    // Small delay to allow click events on suggestions to fire first
    window.setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  }, []);

  const handleAddressFocus = useCallback(() => {
    // Only show suggestions if user has typed and there are results
    if (suggestions.length > 0 && isUserTypingRef.current) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  const handleAddressChange = useCallback(() => {
    // Mark that user is typing - this enables the fetch effect
    isUserTypingRef.current = true;
  }, []);

  // Call this to programmatically set address without triggering autocomplete
  const setAddressProgrammatically = useCallback(() => {
    isUserTypingRef.current = false;
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  return {
    suggestions,
    isFetching,
    showSuggestions,
    containerRef,
    handleSuggestionSelect,
    handleAddressBlur,
    handleAddressFocus,
    handleAddressChange,
    setAddressProgrammatically,
    setShowSuggestions,
  };
}
