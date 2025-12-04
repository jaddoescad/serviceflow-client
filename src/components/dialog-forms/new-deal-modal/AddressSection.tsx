import type { ChangeEvent, MouseEvent } from "react";
import type { ContactAddressRecord } from "@/features/contacts";
import type { PlaceSuggestion } from "@/types/google-places";
import { Input, Select } from "@/components/ui/library";
import type { AddressFormState } from "./types";
import { NEW_CONTACT_OPTION, formatAddressSummary } from "./types";

type AddressSectionProps = {
  addressForm: AddressFormState;
  selectedAddressId: string | typeof NEW_CONTACT_OPTION;
  existingAddresses?: ContactAddressRecord[];
  addressSuggestions: PlaceSuggestion[];
  isFetchingAddress: boolean;
  showAddressSuggestions: boolean;
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
  onAddressSelectChange,
  onAddressFieldChange,
  onAddressLine1Focus,
  onAddressBlur,
  onAddressSuggestionSelect,
}: AddressSectionProps) {
  const handleSuggestionMouseDown = (suggestion: PlaceSuggestion) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onAddressSuggestionSelect(suggestion);
  };

  return (
    <section className="space-y-3">
      {existingAddresses && existingAddresses.length > 0 ? (
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
      ) : null}

      <div className="space-y-2.5">
        <div className="relative">
          <Input
            type="text"
            name="addressLine1"
            label="Address line 1"
            value={addressForm.addressLine1}
            onChange={onAddressFieldChange("addressLine1")}
            onFocus={onAddressLine1Focus}
            onBlur={onAddressBlur}
            placeholder="123 Main Street"
            size="md"
          />
          {showAddressSuggestions ? (
            <div className="absolute left-0 right-0 z-10 mt-1 rounded border border-slate-200 bg-white shadow">
              {isFetchingAddress ? (
                <p className="px-3 py-2 text-[11px] text-slate-500">Searching…</p>
              ) : addressSuggestions.length ? (
                addressSuggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion.placeId}
                    onMouseDown={handleSuggestionMouseDown(suggestion)}
                    className="block w-full px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-100"
                  >
                    {suggestion.description}
                  </button>
                ))
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2.5 md:grid-cols-3">
          <Input
            type="text"
            name="city"
            label="City"
            value={addressForm.city}
            onChange={onAddressFieldChange("city")}
            placeholder="City"
            size="md"
          />
          <Input
            type="text"
            name="state"
            label="State / Province"
            value={addressForm.state}
            onChange={onAddressFieldChange("state")}
            placeholder="State / Province"
            size="md"
          />
          <Input
            type="text"
            name="postalCode"
            label="Postal code"
            value={addressForm.postalCode}
            onChange={onAddressFieldChange("postalCode")}
            placeholder="Postal code"
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
