import type { ChangeEvent, MouseEvent } from "react";
import type { PlaceSuggestion } from "@/types/google-places";
import { Input } from "@/components/ui/library";
import type { AddressFormState } from "./useAddressAutocomplete";

type AddressAutocompleteProps = {
  addressForm: AddressFormState;
  suggestions: PlaceSuggestion[];
  showSuggestions: boolean;
  isFetching: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onAddressFieldChange: <K extends keyof AddressFormState>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onAddressBlur: () => void;
  onAddressFocus: () => void;
  onSuggestionSelect: (suggestion: PlaceSuggestion) => void;
  /** Optional: render content above the address fields (e.g., saved addresses dropdown) */
  headerContent?: React.ReactNode;
  /** Whether to show address line 2 field. Defaults to false. */
  showAddressLine2?: boolean;
};

export function AddressAutocomplete({
  addressForm,
  suggestions,
  showSuggestions,
  isFetching,
  containerRef,
  onAddressFieldChange,
  onAddressBlur,
  onAddressFocus,
  onSuggestionSelect,
  headerContent,
  showAddressLine2 = false,
}: AddressAutocompleteProps) {
  const handleSuggestionMouseDown =
    (suggestion: PlaceSuggestion) => (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onSuggestionSelect(suggestion);
    };

  return (
    <section className="space-y-3">
      {headerContent}

      <div className="space-y-2.5">
        <div ref={containerRef} className="relative">
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
            autoComplete="off"
          />
          {showSuggestions ? (
            <div className="absolute left-0 right-0 z-10 mt-1 rounded border border-slate-200 bg-white shadow">
              {isFetching ? (
                <p className="px-3 py-2 text-[11px] text-slate-500">
                  Searching...
                </p>
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

        {showAddressLine2 ? (
          <Input
            type="text"
            name="addressLine2"
            label="Address line 2"
            value={addressForm.addressLine2}
            onChange={onAddressFieldChange("addressLine2")}
            placeholder="Apt, suite, unit, etc. (optional)"
            size="md"
          />
        ) : null}

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
