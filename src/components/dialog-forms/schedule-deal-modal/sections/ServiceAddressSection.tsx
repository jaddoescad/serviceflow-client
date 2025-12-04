import type { ChangeEvent, MouseEvent } from "react";
import type { ContactAddressRecord } from "@/features/contacts";
import type { PlaceSuggestion } from "@/types/google-places";
import type { AddressFormState } from "../types";
import { formatAddressSummary } from "../utils";

type ServiceAddressSectionProps = {
  addressForm: AddressFormState;
  selectedAddressId: string | "new";
  contactAddresses: ContactAddressRecord[];
  suggestions: PlaceSuggestion[];
  showSuggestions: boolean;
  isFetchingAddress: boolean;
  onAddressFieldChange: <K extends keyof AddressFormState>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddressBlur: () => void;
  onAddressFocus: () => void;
  onAddressSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSuggestionSelect: (suggestion: PlaceSuggestion) => void;
};

export function ServiceAddressSection({
  addressForm,
  selectedAddressId,
  contactAddresses,
  suggestions,
  showSuggestions,
  isFetchingAddress,
  onAddressFieldChange,
  onAddressBlur,
  onAddressFocus,
  onAddressSelectChange,
  onSuggestionSelect,
}: ServiceAddressSectionProps) {
  const handleSuggestionMouseDown = (suggestion: PlaceSuggestion) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSuggestionSelect(suggestion);
  };

  return (
    <section className="space-y-3">
      {contactAddresses.length > 0 ? (
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Saved addresses</span>
          <select
            name="contactAddressSelection"
            value={selectedAddressId}
            onChange={onAddressSelectChange}
            className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
          >
            {contactAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {formatAddressSummary(address)}
              </option>
            ))}
            <option value="new">Add new address</option>
          </select>
        </label>
      ) : null}

      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
          <span>Address</span>
          <div className="relative">
            <input
              type="text"
              value={addressForm.addressLine1}
              onChange={onAddressFieldChange("addressLine1")}
              onFocus={onAddressFocus}
              onBlur={onAddressBlur}
              placeholder="123 Main Street"
              className="w-full rounded border border-slate-200 px-3 py-2 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
            {showSuggestions ? (
              <div className="absolute z-10 mt-1 w-full rounded border border-slate-200 bg-white shadow">
                {isFetchingAddress ? (
                  <p className="px-3 py-2 text-[11px] text-slate-500">Searching…</p>
                ) : suggestions.length ? (
                  suggestions.map((suggestion) => (
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
