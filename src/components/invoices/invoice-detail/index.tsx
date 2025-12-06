"use client";

import { InvoiceSendDialog } from "@/components/dialog-forms/invoice-send-dialog";
import { CancelPaymentRequestDialog } from "@/components/invoices/cancel-payment-request-dialog";

import type { InvoiceDetailProps } from "./types";
import { InvoiceDetailProvider, useInvoiceDetailContext } from "./InvoiceDetailContext";
import { PaymentRequestsSection } from "./PaymentRequestsSection";
import { InvoiceHeader } from "./InvoiceHeader";
import { BillToSection } from "./BillToSection";
import { LineItemsTable } from "./LineItemsTable";
import { PaymentsSection } from "./PaymentsSection";
import { RequestPaymentDialog } from "@/components/dialog-forms/RequestPaymentDialog";
import { SendPaymentRequestDialog } from "@/components/dialog-forms/SendPaymentRequestDialog";
import { SendPaymentReceiptDialog } from "@/components/dialog-forms/SendPaymentReceiptDialog";
import { ReceivePaymentDialog } from "@/components/dialog-forms/ReceivePaymentDialog";
import { DeleteLineItemDialog } from "./DeleteLineItemDialog";

export type { InvoiceDetailProps } from "./types";
export { useInvoiceDetailContext } from "./InvoiceDetailContext";

function InvoiceDetailContent() {
  const ctx = useInvoiceDetailContext();

  const {
    clientEmail,
    clientPhone,
    companyEmail,
    state,
    templates,
    sendInvoiceDialog,
    paymentRequestDialog,
    receivePaymentDialog,
    sendReceiptDialog,
    cancelRequestDialog,
    lineItemDialog,
  } = ctx;

  const { invoiceTemplateDefaults, buildPaymentRequestDefaults } = templates;

  return (
    <div className="space-y-6">
      {state.flashMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-700">
          {state.flashMessage}
        </div>
      ) : null}
      {state.actionError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
          {state.actionError}
        </div>
      ) : null}

      <PaymentRequestsSection />

      <InvoiceHeader />

      <BillToSection />

      <LineItemsTable />

      <PaymentsSection />

      {/* Dialogs */}
      <InvoiceSendDialog
        open={sendInvoiceDialog.isOpen}
        onClose={ctx.closeSendInvoiceDialog}
        onSend={ctx.handleSendInvoice}
        invoiceNumber={state.invoice.invoice_number}
        defaults={{
          emailRecipient: clientEmail,
          emailSubject: invoiceTemplateDefaults.emailSubject,
          emailBody: invoiceTemplateDefaults.emailBody,
          textRecipient: clientPhone,
          textBody: invoiceTemplateDefaults.smsBody,
        }}
        companyEmail={companyEmail}
        isSubmitting={sendInvoiceDialog.isSending}
        errorMessage={sendInvoiceDialog.error}
      />

      <RequestPaymentDialog
        open={paymentRequestDialog.isRequestDialogOpen}
        onClose={ctx.closeRequestPaymentDialog}
        balanceDue={state.invoice.balance_due}
        total={state.invoice.total_amount}
        onSubmit={ctx.handleCreatePaymentRequest}
        submitting={paymentRequestDialog.isCreating}
      />

      <SendPaymentRequestDialog
        open={paymentRequestDialog.isSendDialogOpen}
        onClose={ctx.closeSendPaymentRequestDialog}
        onSend={ctx.handleSendPaymentRequest}
        submitting={paymentRequestDialog.isSending}
        request={paymentRequestDialog.activeRequest}
        templateDefaults={
          paymentRequestDialog.activeRequest
            ? buildPaymentRequestDefaults(paymentRequestDialog.activeRequest)
            : null
        }
        clientPhone={clientPhone}
        clientEmail={clientEmail}
        companyEmail={companyEmail}
      />

      <CancelPaymentRequestDialog
        open={Boolean(cancelRequestDialog.requestToCancel)}
        onClose={ctx.closeCancelRequestDialog}
        onConfirm={ctx.confirmCancelPaymentRequest}
        request={cancelRequestDialog.requestToCancel}
        isSubmitting={cancelRequestDialog.isCancelling}
      />

      <ReceivePaymentDialog
        open={receivePaymentDialog.isOpen}
        onClose={ctx.closeReceivePaymentDialog}
        onSubmit={ctx.handleReceivePayment}
        submitting={receivePaymentDialog.isSubmitting}
        defaultAmount={receivePaymentDialog.defaults.amount}
        defaultDate={new Date().toISOString().split("T")[0]}
        clientEmail={clientEmail}
        defaultReceiptBody={receivePaymentDialog.defaultReceiptBody}
        defaultReceiptSubject={receivePaymentDialog.defaultReceiptSubject}
        paymentRequestId={receivePaymentDialog.defaults.paymentRequestId}
      />

      <SendPaymentReceiptDialog
        open={sendReceiptDialog.isOpen}
        onClose={ctx.closeSendReceiptDialog}
        onSend={ctx.handleSendPaymentReceipt}
        submitting={sendReceiptDialog.isSending}
        payment={sendReceiptDialog.activePayment}
        defaultBody={sendReceiptDialog.defaultBody}
        defaultSubject={sendReceiptDialog.defaultSubject}
        clientEmail={clientEmail}
      />

      <DeleteLineItemDialog
        open={Boolean(lineItemDialog.itemToDelete)}
        onClose={ctx.closeDeleteLineItemDialog}
        onConfirm={ctx.confirmDeleteLineItem}
        submitting={lineItemDialog.isDeleting}
        item={lineItemDialog.itemToDelete}
      />
    </div>
  );
}

export function InvoiceDetail(props: InvoiceDetailProps) {
  return (
    <InvoiceDetailProvider {...props}>
      <InvoiceDetailContent />
    </InvoiceDetailProvider>
  );
}
