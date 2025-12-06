import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";
import { getBrowserInvoiceShareUrl } from "@/lib/invoice-share";
import { renderCommunicationTemplate } from "@/features/communications";
import { createInvoiceDeliveryRepository } from "@/features/invoices";
import type {
  InvoiceRecord,
  InvoicePaymentRequestRecord,
  InvoicePaymentRecord,
  InvoiceLineItemRecord,
} from "@/features/invoices";
import {
  addInvoiceLineItem,
  updateInvoiceLineItem,
  deleteInvoiceLineItem,
} from "@/features/invoices";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import type { InvoiceDeliveryMethod } from "@/types/invoice-delivery";
import { createInvoicePaymentRequest as createInvoicePaymentRequestApi } from "@/features/invoices";
import { apiClient } from "@/services/api";
import { createSupabaseBrowserClient } from "@/supabase/clients/browser";
import { getCommunicationTemplateByKey } from "@/features/communications";
import { queryKeys } from "@/hooks/query-keys";
import { invoiceDetailKeys } from "@/hooks/useInvoiceDetail";

import { formatButtonMarker } from "@/lib/template-variables";
import type { InvoiceDetailProps } from "./types";
import { buildInvoiceTemplateDefaults, buildPaymentRequestTemplateDefaults } from "./utils";

export function useInvoiceDetail({
  companyId,
  companyName,
  companyPhone,
  companyWebsite,
  dealId,
  invoice,
  paymentRequests,
  payments,
  clientName,
  clientEmail,
  clientPhone: clientPhoneNumber,
  invoiceTemplate,
  paymentRequestTemplate,
  paymentReceiptTemplate,
  isArchived = false,
}: InvoiceDetailProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invoiceDeliveryRepository = useMemo(() => createInvoiceDeliveryRepository(), []);
  const supabaseBrowserClient = useMemo(() => createSupabaseBrowserClient(), []);

  // Template state
  const [invoiceTemplateSnapshot, setInvoiceTemplateSnapshot] =
    useState<CommunicationTemplateSnapshot>(invoiceTemplate);
  const [paymentRequestTemplateSnapshot, setPaymentRequestTemplateSnapshot] =
    useState<CommunicationTemplateSnapshot>(paymentRequestTemplate);
  const [paymentReceiptTemplateSnapshot, setPaymentReceiptTemplateSnapshot] =
    useState<CommunicationTemplateSnapshot>(paymentReceiptTemplate);

  useEffect(() => {
    setInvoiceTemplateSnapshot(invoiceTemplate);
  }, [invoiceTemplate]);
  useEffect(() => {
    setPaymentRequestTemplateSnapshot(paymentRequestTemplate);
  }, [paymentRequestTemplate]);
  useEffect(() => {
    setPaymentReceiptTemplateSnapshot(paymentReceiptTemplate);
  }, [paymentReceiptTemplate]);

  // Core state
  const [invoiceState, setInvoiceState] = useState<InvoiceRecord>(invoice);
  const [paymentRequestsState, setPaymentRequestsState] = useState<InvoicePaymentRequestRecord[]>(paymentRequests);
  const [paymentsState, setPaymentsState] = useState<InvoicePaymentRecord[]>(payments);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [defaultReceiptBody, setDefaultReceiptBody] = useState<string>(
    paymentReceiptTemplateSnapshot.emailBody
  );

  // Computed values
  const hasOpenPaymentRequest = useMemo(
    () =>
      paymentRequestsState.some(
        (request) => request.status === "created" || request.status === "sent"
      ),
    [paymentRequestsState]
  );

  const orderedPaymentRequests = useMemo(() => {
    const rank: Record<InvoicePaymentRequestRecord["status"], number> = {
      created: 0,
      sent: 0,
      paid: 1,
      cancelled: 2,
    };

    return paymentRequestsState.filter((request) => request.status !== "paid").sort((a, b) => {
      const rankDiff = (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [paymentRequestsState]);

  const invoiceShareUrl = useMemo(
    () => getBrowserInvoiceShareUrl(invoiceState.public_share_id),
    [invoiceState.public_share_id]
  );

  const invoiceTemplateDefaults = useMemo(
    () =>
      buildInvoiceTemplateDefaults(invoiceTemplateSnapshot, {
        companyName,
        companyPhone,
        companyWebsite,
        clientName,
        invoiceNumber: invoiceState.invoice_number,
        invoiceUrl: invoiceShareUrl,
      }),
    [clientName, companyName, companyPhone, companyWebsite, invoiceTemplateSnapshot, invoiceShareUrl, invoiceState.invoice_number]
  );

  const buildPaymentRequestDefaults = useCallback(
    (request: InvoicePaymentRequestRecord) =>
      buildPaymentRequestTemplateDefaults(paymentRequestTemplateSnapshot, {
        companyName,
        companyPhone,
        companyWebsite,
        clientName,
        invoiceNumber: invoiceState.invoice_number,
        invoiceUrl: invoiceShareUrl,
        paymentAmount: formatCurrency(request.amount),
      }),
    [clientName, companyName, companyPhone, companyWebsite, invoiceShareUrl, invoiceState.invoice_number, paymentRequestTemplateSnapshot]
  );

  const initialInvoiceSendMethod: InvoiceDeliveryMethod = useMemo(() => {
    if (clientEmail && clientPhoneNumber) return "both";
    if (clientPhoneNumber) return "text";
    return "email";
  }, [clientEmail, clientPhoneNumber]);

  const totals = useMemo(() => {
    const lineTotal = invoiceState.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    return {
      subtotal: lineTotal,
      total: invoiceState.total_amount ?? lineTotal,
      balance: invoiceState.balance_due ?? lineTotal,
    };
  }, [invoiceState]);

  // Dialog state
  const [isSendInvoiceDialogOpen, setIsSendInvoiceDialogOpen] = useState(false);
  const [invoiceSendMethod, setInvoiceSendMethod] = useState<InvoiceDeliveryMethod>(initialInvoiceSendMethod);
  const [textRecipient, setTextRecipient] = useState(clientPhoneNumber);
  const [textBody, setTextBody] = useState(invoiceTemplateDefaults.smsBody);
  const [emailRecipient, setEmailRecipient] = useState(clientEmail);
  const [emailCc, setEmailCc] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState(invoiceTemplateDefaults.emailSubject);
  const [emailBody, setEmailBody] = useState(invoiceTemplateDefaults.emailBody);
  const [textBodyEdited, setTextBodyEdited] = useState(false);
  const [emailSubjectEdited, setEmailSubjectEdited] = useState(false);
  const [emailBodyEdited, setEmailBodyEdited] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [sendInvoiceError, setSendInvoiceError] = useState<string | null>(null);

  const [isRequestPaymentDialogOpen, setIsRequestPaymentDialogOpen] = useState(false);
  const [isCreatingPaymentRequest, setIsCreatingPaymentRequest] = useState(false);

  const [isSendPaymentRequestDialogOpen, setIsSendPaymentRequestDialogOpen] = useState(false);
  const [activePaymentRequest, setActivePaymentRequest] = useState<InvoicePaymentRequestRecord | null>(null);
  const [isSendingPaymentRequest, setIsSendingPaymentRequest] = useState(false);

  const [isReceivePaymentDialogOpen, setIsReceivePaymentDialogOpen] = useState(false);
  const [receivePaymentSubmitting, setReceivePaymentSubmitting] = useState(false);
  const [receivePaymentDefaults, setReceivePaymentDefaults] = useState<{
    amount: number;
    paymentRequestId?: string | null;
  }>({ amount: invoiceState.balance_due, paymentRequestId: null });

  const [isSendReceiptDialogOpen, setIsSendReceiptDialogOpen] = useState(false);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<InvoicePaymentRecord | null>(null);
  const [sendReceiptDefaultBody, setSendReceiptDefaultBody] = useState<string>(
    paymentReceiptTemplateSnapshot.emailBody
  );
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);

  const [requestToCancel, setRequestToCancel] = useState<InvoicePaymentRequestRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Line item dialog state
  const [isLineItemDialogOpen, setIsLineItemDialogOpen] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<InvoiceLineItemRecord | null>(null);
  const [isLineItemSubmitting, setIsLineItemSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InvoiceLineItemRecord | null>(null);
  const [isDeletingLineItem, setIsDeletingLineItem] = useState(false);

  // Template refresh effects
  useEffect(() => {
    setDefaultReceiptBody(paymentReceiptTemplateSnapshot.emailBody);
    setSendReceiptDefaultBody(paymentReceiptTemplateSnapshot.emailBody);
  }, [paymentReceiptTemplateSnapshot.emailBody]);

  useEffect(() => {
    if (!isSendInvoiceDialogOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await getCommunicationTemplateByKey(companyId, "invoice_send");
        if (!cancelled && latest) setInvoiceTemplateSnapshot(latest);
      } catch (error) {
        console.error("Failed to refresh invoice template", error);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, isSendInvoiceDialogOpen]);

  useEffect(() => {
    if (!isSendPaymentRequestDialogOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await getCommunicationTemplateByKey(companyId, "invoice_payment_request");
        if (!cancelled && latest) setPaymentRequestTemplateSnapshot(latest);
      } catch (error) {
        console.error("Failed to refresh payment request template", error);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, isSendPaymentRequestDialogOpen]);

  useEffect(() => {
    if (!isSendReceiptDialogOpen && !isReceivePaymentDialogOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await getCommunicationTemplateByKey(companyId, "payment_receipt");
        if (!cancelled && latest) setPaymentReceiptTemplateSnapshot(latest);
      } catch (error) {
        console.error("Failed to refresh payment receipt template", error);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, isReceivePaymentDialogOpen, isSendReceiptDialogOpen]);

  useEffect(() => {
    if (isSendInvoiceDialogOpen) {
      if (!textBodyEdited) setTextBody(invoiceTemplateDefaults.smsBody);
      if (!emailSubjectEdited) setEmailSubject(invoiceTemplateDefaults.emailSubject);
      if (!emailBodyEdited) setEmailBody(invoiceTemplateDefaults.emailBody);
    }
  }, [
    emailBodyEdited,
    emailSubjectEdited,
    invoiceTemplateDefaults,
    isSendInvoiceDialogOpen,
    textBodyEdited,
  ]);

  // Handlers
  const handleInvoiceTextBodyChange = useCallback((value: string) => {
    setTextBodyEdited(true);
    setTextBody(value);
  }, []);

  const handleInvoiceEmailSubjectChange = useCallback((value: string) => {
    setEmailSubjectEdited(true);
    setEmailSubject(value);
  }, []);

  const handleInvoiceEmailBodyChange = useCallback((value: string) => {
    setEmailBodyEdited(true);
    setEmailBody(value);
  }, []);

  const handleBackToDeal = useCallback(() => {
    navigate(`/deals/${dealId}`);
  }, [dealId, navigate]);

  const handleSendInvoice = useCallback(async () => {
    if (isSendingInvoice) return;

    setIsSendingInvoice(true);
    setSendInvoiceError(null);
    setFlashMessage(null);

    try {
      const response = await invoiceDeliveryRepository.sendInvoice({
        dealId,
        invoiceId: invoiceState.id,
        method: invoiceSendMethod,
        text:
          invoiceSendMethod === "both" || invoiceSendMethod === "text"
            ? { to: textRecipient, body: textBody }
            : undefined,
        email:
          invoiceSendMethod === "both" || invoiceSendMethod === "email"
            ? { to: emailRecipient, cc: emailCc || null, subject: emailSubject, body: emailBody }
            : undefined,
      });

      if (response.invoiceStatus) {
        setInvoiceState((prev) => ({ ...prev, status: response.invoiceStatus as InvoiceRecord["status"] }));
      }

      setFlashMessage(
        response.sentEmail && response.sentText
          ? "Invoice sent by email and text."
          : response.sentEmail
            ? "Invoice emailed to the customer."
            : response.sentText
              ? "Invoice text message sent."
              : "Invoice delivery complete."
      );
      setIsSendInvoiceDialogOpen(false);
    } catch (error) {
      console.error("Failed to send invoice", error);
      setSendInvoiceError((error as { message?: string })?.message ?? "We couldn't send the invoice.");
    } finally {
      setIsSendingInvoice(false);
    }
  }, [
    dealId, emailBody, emailCc, emailRecipient, emailSubject, invoiceDeliveryRepository,
    invoiceSendMethod, invoiceState.id, isSendingInvoice, textBody, textRecipient,
  ]);

  const handleCreatePaymentRequest = useCallback(
    async ({ amount, note }: { amount: number; note: string | null }) => {
      setActionError(null);
      setIsCreatingPaymentRequest(true);
      try {
        const created = await createInvoicePaymentRequestApi(dealId, invoiceState.id, { amount, note });
        setPaymentRequestsState((prev) => [created, ...prev]);
        setFlashMessage("Payment request created.");
        setIsRequestPaymentDialogOpen(false);
      } catch (error) {
        console.error("Failed to create payment request", error);
        setActionError((error as { message?: string })?.message ?? "We couldn't create the payment request.");
      } finally {
        setIsCreatingPaymentRequest(false);
      }
    },
    [dealId, invoiceState.id]
  );

  const handleSendPaymentRequest = useCallback(
    async (payload: {
      method: InvoiceDeliveryMethod;
      text?: { to: string; body: string };
      email?: { to: string; cc?: string | null; subject: string; body: string };
    }) => {
      if (!activePaymentRequest) return;

      setIsSendingPaymentRequest(true);
      setActionError(null);

      try {
        const [firstName, ...restName] = clientName.trim().split(" ");
        const templateVars = {
          "company-name": companyName,
          "company-phone": companyPhone ?? "",
          "company-website": companyWebsite ?? "",
          "customer-name": clientName,
          "client-name": clientName,
          "first-name": firstName || clientName || "Client",
          "last-name": restName.join(" "),
          "invoice-number": invoiceState.invoice_number,
          "invoice-button": formatButtonMarker(invoiceShareUrl, "View Invoice"),
          "invoice-url": invoiceShareUrl ?? "",
          "payment-amount": formatCurrency(activePaymentRequest.amount),
        };

        const renderedPayload: typeof payload = {
          method: payload.method,
          text:
            payload.text && (payload.method === "both" || payload.method === "text")
              ? { to: payload.text.to, body: renderCommunicationTemplate(payload.text.body, templateVars) }
              : undefined,
          email:
            payload.email && (payload.method === "both" || payload.method === "email")
              ? {
                  to: payload.email.to,
                  cc: payload.email.cc ?? null,
                  subject: renderCommunicationTemplate(payload.email.subject, templateVars).trim(),
                  body: renderCommunicationTemplate(payload.email.body, templateVars),
                }
              : undefined,
        };

        const data = await apiClient<{ paymentRequest: InvoicePaymentRequestRecord }>(
          `/deals/${dealId}/invoices/${invoiceState.id}/payment-requests/${activePaymentRequest.id}/send`,
          { method: "POST", body: JSON.stringify(renderedPayload) }
        );

        setPaymentRequestsState((prev) =>
          prev.map((request) => (request.id === data.paymentRequest.id ? data.paymentRequest : request))
        );

        setFlashMessage("Payment request sent.");
        setIsSendPaymentRequestDialogOpen(false);
        setActivePaymentRequest(null);
      } catch (error) {
        console.error("Failed to send payment request", error);
        setActionError((error as { message?: string })?.message ?? "We couldn't send the payment request.");
      } finally {
        setIsSendingPaymentRequest(false);
      }
    },
    [activePaymentRequest, companyName, companyPhone, companyWebsite, clientName, dealId, invoiceShareUrl, invoiceState.id, invoiceState.invoice_number]
  );

  const handleReceivePayment = useCallback(
    async (input: {
      amount: number;
      receivedAt: string;
      method: string | null;
      reference: string | null;
      note: string | null;
      sendReceipt: boolean;
      receiptEmail: string | null;
      receiptSubject: string | null;
      receiptBody: string | null;
      paymentRequestId?: string | null;
    }) => {
      setActionError(null);

      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (!user) {
        setActionError("You must be signed in to record a payment.");
        return;
      }

      setReceivePaymentSubmitting(true);

      try {
        const [firstName, ...restName] = clientName.trim().split(" ");
        const templateVars = {
          "company-name": companyName,
          "company-phone": companyPhone ?? "",
          "company-website": companyWebsite ?? "",
          "customer-name": clientName,
          "client-name": clientName,
          "first-name": firstName || clientName || "Client",
          "last-name": restName.join(" "),
          "invoice-number": invoiceState.invoice_number,
          "invoice-button": formatButtonMarker(invoiceShareUrl, "View Invoice"),
          "invoice-url": invoiceShareUrl ?? "",
          "payment-amount": formatCurrency(input.amount),
        };

        const renderedInput = {
          ...input,
          receiptSubject: input.sendReceipt && input.receiptSubject
            ? renderCommunicationTemplate(input.receiptSubject, templateVars).trim()
            : input.receiptSubject,
          receiptBody: input.sendReceipt && input.receiptBody
            ? renderCommunicationTemplate(input.receiptBody, templateVars)
            : input.receiptBody,
        };

        const data = await apiClient<{
          invoice: InvoiceRecord | null;
          payments: InvoicePaymentRecord[];
          paymentRequests: InvoicePaymentRequestRecord[];
        }>(
          `/deals/${dealId}/invoices/${invoiceState.id}/payments`,
          { method: "POST", body: JSON.stringify(renderedInput) }
        );

        if (data.invoice) {
          setInvoiceState((prev) => ({
            ...prev,
            ...data.invoice,
            line_items: prev.line_items ?? data.invoice?.line_items ?? [],
          }));
        }

        setPaymentsState(data.payments);
        setPaymentRequestsState(data.paymentRequests);
        setFlashMessage("Payment recorded successfully.");
        setIsReceivePaymentDialogOpen(false);
      } catch (error) {
        console.error("Failed to record payment", error);
        setActionError((error as { message?: string })?.message ?? "We couldn't record the payment.");
      } finally {
        setReceivePaymentSubmitting(false);
      }
    },
    [clientName, companyName, companyPhone, companyWebsite, dealId, invoiceShareUrl, invoiceState.id, invoiceState.invoice_number, supabaseBrowserClient]
  );

  const openSendPaymentRequestDialog = useCallback((request: InvoicePaymentRequestRecord) => {
    setActivePaymentRequest(request);
    setIsSendPaymentRequestDialogOpen(true);
  }, []);

  const openReceivePaymentDialog = useCallback(
    (defaults?: { amount: number; paymentRequestId?: string | null }) => {
      setReceivePaymentDefaults({
        amount: defaults?.amount ?? invoiceState.balance_due,
        paymentRequestId: defaults?.paymentRequestId ?? null,
      });
      setDefaultReceiptBody(paymentReceiptTemplate.emailBody);
      setIsReceivePaymentDialogOpen(true);
    },
    [invoiceState.balance_due, paymentReceiptTemplate.emailBody]
  );

  const openSendReceiptDialog = useCallback((payment: InvoicePaymentRecord) => {
    setActiveReceiptPayment(payment);
    setSendReceiptDefaultBody(paymentReceiptTemplate.emailBody);
    setIsSendReceiptDialogOpen(true);
  }, [paymentReceiptTemplate.emailBody]);

  const handleSendPaymentReceipt = useCallback(
    async (input: { receiptEmail: string; receiptSubject: string; receiptBody: string }) => {
      if (!activeReceiptPayment) return;

      setIsSendingReceipt(true);
      setActionError(null);

      try {
        const [firstName, ...restName] = clientName.trim().split(" ");
        const templateVars = {
          "company-name": companyName,
          "company-phone": companyPhone ?? "",
          "company-website": companyWebsite ?? "",
          "customer-name": clientName,
          "client-name": clientName,
          "first-name": firstName || clientName || "Client",
          "last-name": restName.join(" "),
          "invoice-number": invoiceState.invoice_number,
          "invoice-button": formatButtonMarker(invoiceShareUrl, "View Invoice"),
          "invoice-url": invoiceShareUrl ?? "",
          "payment-amount": formatCurrency(activeReceiptPayment.amount),
        };

        await apiClient(
          `/deals/${dealId}/invoices/${invoiceState.id}/payments/${activeReceiptPayment.id}/send`,
          {
            method: "POST",
            body: JSON.stringify({
              receiptEmail: input.receiptEmail.trim(),
              receiptSubject: renderCommunicationTemplate(input.receiptSubject, templateVars).trim(),
              receiptBody: renderCommunicationTemplate(input.receiptBody, templateVars),
            }),
          }
        );

        setFlashMessage("Payment confirmation sent.");
        setIsSendReceiptDialogOpen(false);
        setActiveReceiptPayment(null);
      } catch (error) {
        console.error("Failed to send payment confirmation", error);
        setActionError((error as { message?: string })?.message ?? "We couldn't send the payment confirmation.");
      } finally {
        setIsSendingReceipt(false);
      }
    },
    [activeReceiptPayment, clientName, companyName, companyPhone, companyWebsite, dealId, invoiceShareUrl, invoiceState.id, invoiceState.invoice_number]
  );

  const handleCancelPaymentRequest = useCallback((request: InvoicePaymentRequestRecord) => {
    setRequestToCancel(request);
  }, []);

  const confirmCancelPaymentRequest = useCallback(async () => {
    if (!requestToCancel) return;

    setIsCancelling(true);
    setActionError(null);
    try {
      const data = await apiClient<{ deletedRequestId: string }>(
        `/deals/${dealId}/invoices/${invoiceState.id}/payment-requests/${requestToCancel.id}/cancel`,
        { method: "POST" }
      );

      setPaymentRequestsState((prev) => prev.filter((r) => r.id !== data.deletedRequestId));
      setFlashMessage("Payment request deleted.");
      setRequestToCancel(null);
    } catch (error) {
      console.error("Failed to delete payment request", error);
      setActionError((error as { message?: string })?.message ?? "We couldn't delete the payment request.");
    } finally {
      setIsCancelling(false);
    }
  }, [dealId, invoiceState.id, requestToCancel]);

  // Line item handlers
  const openAddLineItemDialog = useCallback(() => {
    setEditingLineItem(null);
    setIsLineItemDialogOpen(true);
  }, []);

  const openEditLineItemDialog = useCallback((item: InvoiceLineItemRecord) => {
    setEditingLineItem(item);
    setIsLineItemDialogOpen(true);
  }, []);

  const handleLineItemSubmit = useCallback(
    async (data: { name: string; description: string | null; quantity: number; unit_price: number }) => {
      setActionError(null);
      setIsLineItemSubmitting(true);

      try {
        if (editingLineItem) {
          // Update existing item
          const result = await updateInvoiceLineItem(dealId, invoiceState.id, editingLineItem.id, data);
          setInvoiceState((prev) => ({
            ...prev,
            ...result.invoice,
            line_items: prev.line_items.map((item) =>
              item.id === result.lineItem.id ? result.lineItem : item
            ),
          }));
          setFlashMessage("Line item updated.");
        } else {
          // Add new item
          const result = await addInvoiceLineItem(dealId, invoiceState.id, data);
          setInvoiceState((prev) => ({
            ...prev,
            ...result.invoice,
            line_items: [...prev.line_items, result.lineItem],
          }));
          setFlashMessage("Line item added.");
        }

        // Invalidate caches so other pages show updated invoice totals
        queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
        queryClient.invalidateQueries({ queryKey: invoiceDetailKeys.detail(dealId, invoiceState.id) });

        setIsLineItemDialogOpen(false);
        setEditingLineItem(null);
      } catch (error) {
        console.error("Failed to save line item", error);
        setActionError((error as { message?: string })?.message ?? "We couldn't save the line item.");
      } finally {
        setIsLineItemSubmitting(false);
      }
    },
    [dealId, editingLineItem, invoiceState.id, queryClient]
  );

  const openDeleteLineItemDialog = useCallback((item: InvoiceLineItemRecord) => {
    setItemToDelete(item);
  }, []);

  const confirmDeleteLineItem = useCallback(async () => {
    if (!itemToDelete) return;

    setActionError(null);
    setIsDeletingLineItem(true);

    try {
      const result = await deleteInvoiceLineItem(dealId, invoiceState.id, itemToDelete.id);
      setInvoiceState((prev) => ({
        ...prev,
        ...result.invoice,
        line_items: result.lineItems,
      }));
      setFlashMessage("Line item deleted.");
      setItemToDelete(null);

      // Invalidate caches so other pages show updated invoice totals
      queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: invoiceDetailKeys.detail(dealId, invoiceState.id) });
    } catch (error) {
      console.error("Failed to delete line item", error);
      setActionError((error as { message?: string })?.message ?? "We couldn't delete the line item.");
    } finally {
      setIsDeletingLineItem(false);
    }
  }, [dealId, invoiceState.id, itemToDelete, queryClient]);

  return {
    // State
    invoiceState,
    paymentsState,
    flashMessage,
    actionError,
    isArchived,

    // Computed
    hasOpenPaymentRequest,
    orderedPaymentRequests,
    invoiceShareUrl,
    totals,

    // Dialog state
    isSendInvoiceDialogOpen,
    setIsSendInvoiceDialogOpen,
    invoiceSendMethod,
    setInvoiceSendMethod,
    textRecipient,
    setTextRecipient,
    textBody,
    emailRecipient,
    setEmailRecipient,
    emailCc,
    setEmailCc,
    emailSubject,
    emailBody,
    isSendingInvoice,
    sendInvoiceError,

    isRequestPaymentDialogOpen,
    setIsRequestPaymentDialogOpen,
    isCreatingPaymentRequest,

    isSendPaymentRequestDialogOpen,
    setIsSendPaymentRequestDialogOpen,
    activePaymentRequest,
    setActivePaymentRequest,
    isSendingPaymentRequest,

    isReceivePaymentDialogOpen,
    setIsReceivePaymentDialogOpen,
    receivePaymentSubmitting,
    receivePaymentDefaults,
    defaultReceiptBody,

    isSendReceiptDialogOpen,
    setIsSendReceiptDialogOpen,
    activeReceiptPayment,
    setActiveReceiptPayment,
    sendReceiptDefaultBody,
    isSendingReceipt,

    requestToCancel,
    setRequestToCancel,
    isCancelling,

    // Template defaults
    paymentReceiptTemplateSnapshot,
    buildPaymentRequestDefaults,

    // Handlers
    handleInvoiceTextBodyChange,
    handleInvoiceEmailSubjectChange,
    handleInvoiceEmailBodyChange,
    handleBackToDeal,
    handleSendInvoice,
    handleCreatePaymentRequest,
    handleSendPaymentRequest,
    handleReceivePayment,
    openSendPaymentRequestDialog,
    openReceivePaymentDialog,
    openSendReceiptDialog,
    handleSendPaymentReceipt,
    handleCancelPaymentRequest,
    confirmCancelPaymentRequest,

    // Line item state
    isLineItemDialogOpen,
    setIsLineItemDialogOpen,
    editingLineItem,
    setEditingLineItem,
    isLineItemSubmitting,
    itemToDelete,
    setItemToDelete,
    isDeletingLineItem,

    // Line item handlers
    openAddLineItemDialog,
    openEditLineItemDialog,
    handleLineItemSubmit,
    openDeleteLineItemDialog,
    confirmDeleteLineItem,
  };
}
