import type { ChangeEvent, RefObject } from "react";
import type { PlaceSuggestion } from "@/types/google-places";
import { AddressAutocomplete, type AddressFormState } from "@/components/shared";

type ServiceAddressSectionProps = {
  addressForm: AddressFormState;
  suggestions: PlaceSuggestion[];
  showSuggestions: boolean;
  isFetchingAddress: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  onAddressFieldChange: <K extends keyof AddressFormState>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddressBlur: () => void;
  onAddressFocus: () => void;
  onSuggestionSelect: (suggestion: PlaceSuggestion) => void;
};

export function ServiceAddressSection({
  addressForm,
  suggestions,
  showSuggestions,
  isFetchingAddress,
  containerRef,
  onAddressFieldChange,
  onAddressBlur,
  onAddressFocus,
  onSuggestionSelect,
}: ServiceAddressSectionProps) {
  return (
    <AddressAutocomplete
      addressForm={addressForm}
      suggestions={suggestions}
      showSuggestions={showSuggestions}
      isFetching={isFetchingAddress}
      containerRef={containerRef}
      onAddressFieldChange={onAddressFieldChange}
      onAddressBlur={onAddressBlur}
      onAddressFocus={onAddressFocus}
      onSuggestionSelect={onSuggestionSelect}
    />
  );
}
