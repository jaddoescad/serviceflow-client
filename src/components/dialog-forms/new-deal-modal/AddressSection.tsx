import type { ChangeEvent, MouseEvent } from "react";
import type { ContactAddressRecord } from "@/features/contacts";
import type { PlaceSuggestion } from "@/types/google-places";
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
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Saved addresses</span>
          <select
            name="contactAddressSelection"
            value={selectedAddressId}
            onChange={onAddressSelectChange}
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            {existingAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {formatAddressSummary(address)}
              </option>
            ))}
            <option value={NEW_CONTACT_OPTION}>Add new address</option>
          </select>
        </label>
      ) : null}

      <div className="space-y-2.5">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Address line 1</span>
          <input
            type="text"
            value={addressForm.addressLine1}
            onChange={onAddressFieldChange("addressLine1")}
            onFocus={onAddressLine1Focus}
            onBlur={onAddressBlur}
            placeholder="123 Main Street"
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          />
          {showAddressSuggestions ? (
            <div className="relative">
              <div className="absolute z-10 mt-1 w-full rounded border border-slate-200 bg-white shadow">
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
            </div>
          ) : null}
        </label>

        <div className="grid gap-2.5 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>City</span>
            <input
              type="text"
              value={addressForm.city}
              onChange={onAddressFieldChange("city")}
              placeholder="City"
              className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>State / Province</span>
            <input
              type="text"
              value={addressForm.state}
              onChange={onAddressFieldChange("state")}
              placeholder="State / Province"
              className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Postal code</span>
            <input
              type="text"
              value={addressForm.postalCode}
              onChange={onAddressFieldChange("postalCode")}
              placeholder="Postal code"
              className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
