import type { ChangeEvent, MouseEvent } from "react";
import type { ContactAddressRecord } from "@/features/contacts";
import type { PlaceSuggestion } from "@/types/google-places";
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
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Service Address
      </h3>
      {contactAddresses.length ? (
        <div className="space-y-1.5 rounded border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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
        <div className="space-y-2.5 rounded border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              New address
            </p>
            {contactAddresses.length ? (
              <button
                type="button"
                onClick={onClearAddress}
                className="text-[11px] font-semibold text-slate-600 underline-offset-2 transition hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Address line 1</span>
            <div className="relative">
              <input
                type="text"
                value={addressForm.addressLine1}
                onChange={onAddressFieldChange("addressLine1")}
                onFocus={onAddressFocus}
                onBlur={onAddressBlur}
                placeholder="123 Main Street"
                className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
              />
              {selectedAddressId === "new" && showSuggestions ? (
                <div className="absolute z-10 mt-1 w-full rounded border border-slate-200 bg-white shadow">
                  {isFetchingAddress ? (
                    <p className="px-3 py-2 text-[11px] text-slate-500">Searching…</p>
                  ) : suggestions.length ? (
                    suggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion.placeId}
                        onMouseDown={handleSuggestionMouseDown(suggestion)}
                        className="block w-full px-3 py-1.5 text-left text-[11px] text-slate-600 hover:bg-slate-100"
                      >
                        {suggestion.description}
                      </button>
                    ))
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Address line 2</span>
            <input
              type="text"
              value={addressForm.addressLine2}
              onChange={onAddressFieldChange("addressLine2")}
              placeholder="Apartment, suite, etc."
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>

          <div className="grid gap-2.5 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
              <span>City</span>
              <input
                type="text"
                value={addressForm.city}
                onChange={onAddressFieldChange("city")}
                placeholder="City"
                className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
              <span>State / Province</span>
              <input
                type="text"
                value={addressForm.state}
                onChange={onAddressFieldChange("state")}
                placeholder="State / Province"
                className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
              <span>Postal code</span>
              <input
                type="text"
                value={addressForm.postalCode}
                onChange={onAddressFieldChange("postalCode")}
                placeholder="Postal code"
                className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-600">
            <span>Country</span>
            <input
              type="text"
              value={addressForm.country}
              onChange={onAddressFieldChange("country")}
              placeholder="Country"
              className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-[12px] shadow-sm focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      ) : selectedContactAddress ? (
        <div className="space-y-1.5 rounded border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Selected address
            </p>
            <button
              type="button"
              onClick={onUseNewAddress}
              className="text-[11px] font-semibold text-slate-600 underline-offset-2 transition hover:underline"
            >
              Use new address
            </button>
          </div>
          <div className="space-y-0.5 text-[11px] text-slate-600">
            <p className="font-medium text-slate-700">
              {formatAddressSummary(selectedContactAddress)}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
