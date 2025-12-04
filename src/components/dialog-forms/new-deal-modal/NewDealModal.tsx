"use client";

import { Modal, Button } from "@/components/ui/library";
import type { NewDealModalProps } from "./types";
import { useNewDealForm } from "./useNewDealForm";
import { ContactInfoSection } from "./ContactInfoSection";
import { AddressSection } from "./AddressSection";
import { DealDetailsSection } from "./DealDetailsSection";
import { TeamAssignmentSection } from "./TeamAssignmentSection";

export function NewDealModal(props: NewDealModalProps) {
  const { open, onClose, stages, deal } = props;

  const {
    form,
    addressForm,
    selectedAddressId,
    isSubmitting,
    error,
    dealSources,
    isLoadingDealSources,
    addressSuggestions,
    isFetchingAddress,
    showAddressSuggestions,
    memberOptions,
    modalTitle,
    submitLabel,
    isEditMode,
    dripPromptState,
    isSavingDripChoice,
    dripError,
    handleInputChange,
    handleAddressSelectChange,
    handleAddressFieldChange,
    handleAddressLine1Focus,
    handleAddressBlur,
    handleAddressSuggestionSelect,
    handleSubmit,
    handleEnableDrips,
    handleDisableDrips,
    handleCloseDripPrompt,
  } = useNewDealForm(props);

  if (!open) {
    return null;
  }

  // Show drip prompt step after deal is created
  if (dripPromptState) {
    return (
      <Modal
        open={open}
        onClose={handleCloseDripPrompt}
        labelledBy="drip-prompt-title"
        ariaLabel="Enable drips"
        size="sm"
        align="top"
      >
        <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-lg">
          <header className="flex items-center justify-between rounded-t-lg border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Automations</p>
              <h2 id="drip-prompt-title" className="text-sm font-semibold text-slate-900">
                Enable drips?
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseDripPrompt}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="px-4 py-4">
            <p className="text-[12px] text-slate-600">
              <span className="font-medium">{dripPromptState.dealLabel}</span> has been created. Would you like to enable automated drip messages for this deal?
            </p>
            {dripError ? (
              <p className="mt-3 rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
                {dripError}
              </p>
            ) : null}
          </div>

          <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <Button variant="secondary" onClick={handleDisableDrips} disabled={isSavingDripChoice}>
              Disable drips
            </Button>
            <Button variant="primary" onClick={handleEnableDrips} disabled={isSavingDripChoice}>
              {isSavingDripChoice ? "Saving…" : "Enable drips"}
            </Button>
          </footer>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="new-deal-modal-title"
      ariaLabel={modalTitle}
      size="xl"
      align="top"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
        <header className="flex items-center justify-between rounded-t-lg border-b border-slate-200 px-4 py-3">
          <h2 id="new-deal-modal-title" className="text-sm font-semibold text-slate-900">
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 px-4 py-5"
        >
          <ContactInfoSection
            form={form}
            onInputChange={handleInputChange}
          />

          <AddressSection
            addressForm={addressForm}
            selectedAddressId={selectedAddressId}
            existingAddresses={deal?.contact?.addresses}
            addressSuggestions={addressSuggestions}
            isFetchingAddress={isFetchingAddress}
            showAddressSuggestions={showAddressSuggestions}
            onAddressSelectChange={handleAddressSelectChange}
            onAddressFieldChange={handleAddressFieldChange}
            onAddressLine1Focus={handleAddressLine1Focus}
            onAddressBlur={handleAddressBlur}
            onAddressSuggestionSelect={handleAddressSuggestionSelect}
          />

          <TeamAssignmentSection
            form={form}
            memberOptions={memberOptions}
            dealSources={dealSources}
            isLoadingDealSources={isLoadingDealSources}
            onInputChange={handleInputChange}
          />

          {isEditMode && (
            <DealDetailsSection
              form={form}
              stages={stages}
              onInputChange={handleInputChange}
            />
          )}

          {error ? (
            <p className="rounded border border-red-200 bg-red-100 px-3 py-2 text-[12px] font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <footer className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </footer>
        </form>
      </div>
    </Modal>
  );
}
