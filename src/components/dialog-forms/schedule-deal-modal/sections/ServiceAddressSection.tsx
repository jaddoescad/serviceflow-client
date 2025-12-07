import type { ChangeEvent, MouseEvent } from "react";
import type { PlaceSuggestion } from "@/types/google-places";
import { Input } from "@/components/ui/library";
import type { AddressFormState } from "../types";

type ServiceAddressSectionProps = {
  addressForm: AddressFormState;
  suggestions: PlaceSuggestion[];
  showSuggestions: boolean;
  isFetchingAddress: boolean;
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
  onAddressFieldChange,
  onAddressBlur,
  onAddressFocus,
  onSuggestionSelect,
}: ServiceAddressSectionProps) {
  const handleSuggestionMouseDown = (suggestion: PlaceSuggestion) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSuggestionSelect(suggestion);
  };

  return (
    <section className="space-y-2.5">
      <div className="relative">
        <Input
          type="text"
          name="addressLine1"
          label="Address line 1"
          value={addressForm.addressLine1}
          onChange={onAddressFieldChange("addressLine1")}
          onFocus={onAddressFocus}
          onBlur={onAddressBlur}
          placeholder="123 Main Street"
          size="md"
        />
        {showSuggestions ? (
          <div className="absolute left-0 right-0 z-10 mt-1 rounded border border-slate-200 bg-white shadow">
            {isFetchingAddress ? (
              <p className="px-3 py-2 text-[11px] text-slate-500">Searching…</p>
            ) : suggestions.length ? (
              suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.placeId}
                  onMouseDown={handleSuggestionMouseDown(suggestion)}
                  className="block w-full px-3 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-100"
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
    </section>
  );
}
