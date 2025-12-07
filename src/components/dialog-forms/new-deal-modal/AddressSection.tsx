import type { ChangeEvent, RefObject } from "react";
import type { ContactAddressRecord } from "@/features/contacts";
import type { PlaceSuggestion } from "@/types/google-places";
import { Select } from "@/components/ui/library";
import { AddressAutocomplete } from "@/components/shared";
import type { AddressFormState } from "./types";
import { NEW_CONTACT_OPTION, formatAddressSummary } from "./types";

type AddressSectionProps = {
  addressForm: AddressFormState;
  selectedAddressId: string | typeof NEW_CONTACT_OPTION;
  existingAddresses?: ContactAddressRecord[];
  addressSuggestions: PlaceSuggestion[];
  isFetchingAddress: boolean;
  showAddressSuggestions: boolean;
  addressContainerRef: RefObject<HTMLDivElement | null>;
  onAddressSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onAddressFieldChange: (field: keyof AddressFormState) => (event: ChangeEvent<HTMLInputElement>) => void;
  onAddressLine1Focus: () => void;
  onAddressBlur: () => void;
  onAddressSuggestionSelect: (suggestion: PlaceSuggestion) => Promise<void>;
};

export function AddressSection({
  addressForm,
  selectedAddressId,
  existingAddresses,
  addressSuggestions,
  isFetchingAddress,
  showAddressSuggestions,
  addressContainerRef,
  onAddressSelectChange,
  onAddressFieldChange,
  onAddressLine1Focus,
  onAddressBlur,
  onAddressSuggestionSelect,
}: AddressSectionProps) {
  const headerContent =
    existingAddresses && existingAddresses.length > 0 ? (
      <Select
        name="contactAddressSelection"
        label="Saved addresses"
        value={selectedAddressId}
        onChange={onAddressSelectChange}
        size="md"
      >
        {existingAddresses.map((address) => (
          <option key={address.id} value={address.id}>
            {formatAddressSummary(address)}
          </option>
        ))}
        <option value={NEW_CONTACT_OPTION}>Add new address</option>
      </Select>
    ) : null;

  return (
    <AddressAutocomplete
      addressForm={addressForm}
      suggestions={addressSuggestions}
      showSuggestions={showAddressSuggestions}
      isFetching={isFetchingAddress}
      containerRef={addressContainerRef}
      onAddressFieldChange={onAddressFieldChange}
      onAddressBlur={onAddressBlur}
      onAddressFocus={onAddressLine1Focus}
      onSuggestionSelect={onAddressSuggestionSelect}
      headerContent={headerContent}
    />
  );
}
