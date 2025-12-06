"use client";

import { useState } from "react";
import { QuoteBuilderHeader } from "@/components/quotes/quote-builder-header";
import { QuoteSendDialog } from "@/components/dialog-forms/quote-send-dialog";
import { WorkOrderDeliveryDialog } from "@/components/dialog-forms/work-order-delivery-dialog";
import { QuoteDetailsEditor } from "../quote-details-editor";
import { QuoteLineItemsEditor } from "../quote-line-items-editor";
import { QuoteClientMessageEditor } from "../quote-client-message-editor";
import { QuoteAttachmentsEditor } from "../quote-attachments-editor";

import { QuoteFormProvider, useQuoteFormContext } from "./QuoteFormContext";
import type { QuoteFormProps } from "./types";

export type { QuoteFormProps } from "./types";
export { useQuoteFormContext } from "./QuoteFormContext";

type QuoteActionsMenuProps = {
  quoteStatus?: string;
  isDeleting: boolean;
  isAcceptingWithoutSignature: boolean;
  onAcceptWithoutSignature: () => void;
  onDelete: () => void;
};

function QuoteActionsMenu({
  quoteStatus,
  isDeleting,
  isAcceptingWithoutSignature,
  onAcceptWithoutSignature,
  onDelete,
}: QuoteActionsMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  const canAcceptWithoutSignature = quoteStatus !== "accepted";

  return (
    <>
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
        >
          More
        </button>
      ) : (
        <>
          {canAcceptWithoutSignature && (
            <button
              type="button"
              onClick={() => setShowAcceptConfirm(true)}
              disabled={isAcceptingWithoutSignature}
              className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isAcceptingWithoutSignature ? "Accepting..." : "Accept Without Signature"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete Quote"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            Less
          </button>
        </>
      )}

      {/* Accept Without Signature Confirmation Dialog */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Accept Without Signature?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to accept this quote without requiring a customer signature?
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setShowAcceptConfirm(false)}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAcceptConfirm(false);
                  onAcceptWithoutSignature();
                }}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:w-auto"
              >
                Yes, Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete Quote?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this quote? This action cannot be undone.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 sm:w-auto"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuoteFormContent() {
  const ctx = useQuoteFormContext();

  const {
    companyId,
    companyName,
    dealId,
    clientName,
    clientEmail,
    clientPhone,
    propertyAddress,
    companyBranding,
    taxRate,
    isArchived,
    state,
    attachments: attachmentsState,
    sendDialog,
    workOrder,
    computed,
    isNavigatingBack,
  } = ctx;

  return (
    <>
      {isNavigatingBack ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <svg className="h-8 w-8 animate-spin text-white" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" />
          </svg>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-white">Returning to deal...</p>
        </div>
      ) : null}

      <QuoteSendDialog
        open={sendDialog.isOpen}
        onClose={ctx.closeSendDialog}
        onSend={ctx.handleSendProposal}
        quoteNumber={computed.displayQuoteNumber}
        variant={sendDialog.context}
        changeOrderNumber={sendDialog.activeChangeOrderNumber}
        defaults={{
          emailRecipient: sendDialog.emailRecipient,
          emailCc: sendDialog.emailCc,
          emailSubject: sendDialog.emailSubject,
          emailBody: sendDialog.emailBody,
          textRecipient: sendDialog.textRecipient,
          textBody: sendDialog.textBody,
        }}
        isSubmitting={sendDialog.isSending}
        errorMessage={sendDialog.error}
      />

      <WorkOrderDeliveryDialog
        open={Boolean(workOrder.dialogState)}
        onClose={ctx.closeWorkOrderDialog}
        method={workOrder.dialogState?.method ?? "email"}
        variant={workOrder.dialogState?.variant ?? "standard"}
        defaults={workOrder.currentDefaults ?? { smsBody: "", emailSubject: "", emailBody: "" }}
        workOrderUrl={workOrder.currentUrl}
        companyName={companyName}
        clientName={clientName}
        workOrderAddress={propertyAddress}
        onSend={ctx.handleWorkOrderDeliverySubmit}
        isSubmitting={workOrder.isSending}
        errorMessage={workOrder.error}
      />

      <QuoteBuilderHeader
        clientName={clientName}
        quoteNumber={computed.displayQuoteNumber}
        createdAt={state.createdAt}
        statusClass={computed.statusClass}
        statusLabel={computed.statusLabel}
        workOrderUrl={workOrder.shareUrl}
        secretWorkOrderUrl={workOrder.secretShareUrl}
        invoiceUrl={computed.invoiceUrl}
        shareDisabledReason={computed.shareDisabledReason}
        isArchived={isArchived}
        onRequestSend={ctx.handleWorkOrderSendRequest}
      />

      <QuoteDetailsEditor
        clientName={clientName}
        clientPhone={clientPhone}
        clientEmail={clientEmail}
        propertyAddress={propertyAddress}
      />

      <QuoteLineItemsEditor
        companyId={companyId}
        dealId={dealId}
        quoteId={state.quoteId}
        lineItems={state.lineItems}
        editingLineItems={state.editingLineItems}
        productTemplateOptions={state.productTemplateOptions}
        readOnly={state.isProposalLocked}
        readOnlyReason={isArchived ? "archived" : state.status === "accepted" ? "accepted" : undefined}
        quoteNumber={computed.displayQuoteNumber}
        taxRate={taxRate ?? 0}
        customerViewUrl={computed.customerViewUrl}
        totals={computed.totals}
        onLineItemChange={ctx.handleLineItemFieldChange}
        onLineItemUnitPriceChange={ctx.handleLineItemUnitPriceChange}
        onAddLineItem={ctx.handleAddLineItem}
        onAddDiscount={ctx.handleAddDiscount}
        onDeleteLineItem={ctx.handleDeleteLineItem}
        onToggleEdit={ctx.toggleLineItemEdit}
        onCancelEdit={ctx.cancelLineItemEdit}
        onApplyTemplate={ctx.handleApplyTemplate}
        onSave={() => void ctx.handleSaveQuote()}
        onSendProposal={() => ctx.openSendDialog({ variant: "proposal" })}
        onSendChangeOrder={(changeOrderNumber) =>
          ctx.openSendDialog({ variant: "change_order", changeOrderNumber })
        }
      />

      <QuoteClientMessageEditor
        clientMessage={state.clientMessage}
        disclaimer={state.disclaimer}
        onClientMessageChange={ctx.setClientMessage}
        onDisclaimerChange={ctx.setDisclaimer}
        onSave={() => void ctx.handleSaveQuote()}
      />

      <QuoteAttachmentsEditor
        quoteId={state.quoteId}
        attachments={attachmentsState.attachments}
        pendingUploads={attachmentsState.pendingUploads}
        imageAttachments={attachmentsState.imageAttachments}
        attachmentsError={attachmentsState.error}
        isUploadingAttachment={attachmentsState.isUploading}
        deletingAttachmentId={attachmentsState.deletingId}
        activeAttachmentIndex={attachmentsState.activeIndex}
        onAttachmentInputChange={ctx.handleAttachmentInputChange}
        onAttachmentDelete={ctx.handleAttachmentDelete}
        onOpenAttachment={ctx.handleOpenAttachment}
        onCloseAttachment={ctx.handleCloseAttachment}
        onStepAttachment={ctx.handleStepAttachment}
      />

      <section className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {workOrder.successMessage ? (
              <p className="text-sm font-semibold text-emerald-600">{workOrder.successMessage}</p>
            ) : sendDialog.successMessage ? (
              <p className="text-sm font-semibold text-emerald-600">{sendDialog.successMessage}</p>
            ) : workOrder.error ? (
              <p className="text-sm font-medium text-rose-600">{workOrder.error}</p>
            ) : sendDialog.error ? (
              <p className="text-sm font-medium text-rose-600">{sendDialog.error}</p>
            ) : state.saveError ? (
              <p className="text-sm font-medium text-rose-600">{state.saveError}</p>
            ) : ctx.acceptWithoutSignatureError ? (
              <p className="text-sm font-medium text-rose-600">{ctx.acceptWithoutSignatureError}</p>
            ) : null}
          </div>
          {!isArchived && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => ctx.openSendDialog()}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
              >
                Send Proposal
              </button>
              <QuoteActionsMenu
                quoteStatus={state.status}
                isDeleting={state.isDeleting}
                isAcceptingWithoutSignature={ctx.isAcceptingWithoutSignature}
                onAcceptWithoutSignature={ctx.handleAcceptWithoutSignature}
                onDelete={ctx.handleDeleteQuote}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function QuoteForm(props: QuoteFormProps) {
  return (
    <QuoteFormProvider {...props}>
      <QuoteFormContent />
    </QuoteFormProvider>
  );
}
