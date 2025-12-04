import type { ChangeEvent, MouseEvent } from "react";
import type { ContactAddressRecord } from "@/features/contacts";
import type { PlaceSuggestion } from "@/types/google-places";
import { Input } from "@/components/ui/library";
import type { AddressFormState } from "../types";
import { formatAddressSummary } from "../utils";

type ServiceAddressSectionProps = {
  addressForm: AddressFormState;
  selectedAddressId: string | "new";
  contactAddresses: ContactAddressRecord[];
  selectedContactAddress: ContactAddressRecord | null;
  suggestions: PlaceSuggestion[];
  showSuggestions: boolean;
  isFetchingAddress: boolean;
  onAddressFieldChange: <K extends keyof AddressFormState>(
    field: K
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddressBlur: () => void;
  onAddressFocus: () => void;
  onSelectSavedAddress: (address: ContactAddressRecord) => void;
  onUseNewAddress: () => void;
  onClearAddress: () => void;
  onSuggestionSelect: (suggestion: PlaceSuggestion) => void;
};

export function ServiceAddressSection({
  addressForm,
  selectedAddressId,
  contactAddresses,
  selectedContactAddress,
  suggestions,
  showSuggestions,
  isFetchingAddress,
  onAddressFieldChange,
  onAddressBlur,
  onAddressFocus,
  onSelectSavedAddress,
  onUseNewAddress,
  onClearAddress,
  onSuggestionSelect,
}: ServiceAddressSectionProps) {
  const handleSuggestionMouseDown = (suggestion: PlaceSuggestion) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSuggestionSelect(suggestion);
  };

  return (
    <section className="space-y-2.5">
      {contactAddresses.length ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-slate-500">
            Saved addresses
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contactAddresses.map((address) => {
              const isSelected = selectedAddressId === address.id;
              const buttonClasses = isSelected
                ? "border-accent bg-accent/5 text-accent"
                : "border-slate-200 text-slate-600 hover:border-accent hover:text-accent";

              return (
                <button
                  type="button"
                  key={address.id}
                  onClick={() => onSelectSavedAddress(address)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${buttonClasses}`}
                >
                  {formatAddressSummary(address)}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onUseNewAddress}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                selectedAddressId === "new"
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-dashed border-slate-300 text-slate-500 hover:border-accent hover:text-accent"
              }`}
            >
              Add new address
            </button>
          </div>
        </div>
      ) : null}

      {selectedAddressId === "new" ? (
        <div className="space-y-2.5">
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
            {selectedAddressId === "new" && showSuggestions ? (
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

        </div>
      ) : null}
    </section>
  );
}
