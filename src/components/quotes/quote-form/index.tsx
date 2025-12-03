"use client";

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
        onSend={() => {
          void ctx.handleSendProposal();
        }}
        quoteNumber={computed.displayQuoteNumber}
        variant={sendDialog.context}
        changeOrderNumber={sendDialog.activeChangeOrderNumber}
        sendMethod={sendDialog.method}
        onSendMethodChange={(method) => ctx.setSendMethod(method)}
        emailRecipient={sendDialog.emailRecipient}
        onEmailRecipientChange={(value) => ctx.setSendEmailRecipient(value)}
        emailCc={sendDialog.emailCc}
        onEmailCcChange={(value) => ctx.setSendEmailCc(value)}
        emailSubject={sendDialog.emailSubject}
        onEmailSubjectChange={(value) => ctx.setSendEmailSubject(value)}
        emailBody={sendDialog.emailBody}
        onEmailBodyChange={(value) => ctx.setSendEmailBody(value)}
        textRecipient={sendDialog.textRecipient}
        onTextRecipientChange={(value) => ctx.setSendTextRecipient(value)}
        textBody={sendDialog.textBody}
        onTextBodyChange={(value) => ctx.setSendTextBody(value)}
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
        propertyAddress={propertyAddress}
        statusClass={computed.statusClass}
        statusLabel={computed.statusLabel}
        onBack={ctx.handleBackToDeal}
        isNavigatingBack={isNavigatingBack}
        workOrderUrl={workOrder.shareUrl}
        secretWorkOrderUrl={workOrder.secretShareUrl}
        customerViewUrl={computed.customerViewUrl}
        invoiceUrl={computed.invoiceUrl}
        shareDisabledReason={computed.shareDisabledReason}
        isArchived={isArchived}
        onRequestSend={ctx.handleWorkOrderSendRequest}
        quoteStatus={state.status}
        onAcceptWithoutSignature={ctx.handleAcceptWithoutSignature}
        isAcceptingWithoutSignature={ctx.isAcceptingWithoutSignature}
        acceptWithoutSignatureError={ctx.acceptWithoutSignatureError}
      />

      <QuoteDetailsEditor
        clientName={clientName}
        clientPhone={clientPhone}
        clientEmail={clientEmail}
        propertyAddress={propertyAddress}
        quoteNumber={computed.displayQuoteNumber}
        createdAt={state.createdAt}
        lastSavedAt={state.lastSavedAt}
        isSaving={state.isSaving}
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
            ) : (
              <p className="text-sm text-slate-600">
                {state.isSaving ? "Saving..." : state.lastSavedAt ? `Last saved ${computed.lastSavedLabel}` : "Not yet saved"}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {!isArchived && (
              <button
                type="button"
                onClick={() => ctx.openSendDialog()}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
              >
                Send Proposal
              </button>
            )}
            {!isArchived && (
              <button
                type="button"
                onClick={ctx.handleDeleteQuote}
                disabled={state.isDeleting}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {state.isDeleting ? "Deleting..." : "Delete Quote"}
              </button>
            )}
          </div>
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
