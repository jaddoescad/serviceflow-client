"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

import type { InvoiceDetailProps } from "./types";
import { buildInvoiceTemplateDefaults, buildPaymentRequestTemplateDefaults } from "./utils";

// ============================================================================
// Context Types
// ============================================================================

type InvoiceState = {
  invoice: InvoiceRecord;
  payments: InvoicePaymentRecord[];
  paymentRequests: InvoicePaymentRequestRecord[];
  flashMessage: string | null;
  actionError: string | null;
  isArchived: boolean;
};

type InvoiceComputed = {
  hasOpenPaymentRequest: boolean;
  orderedPaymentRequests: InvoicePaymentRequestRecord[];
  invoiceShareUrl: string | null;
  totals: { subtotal: number; total: number; balance: number };
};

type SendInvoiceDialogState = {
  isOpen: boolean;
  method: InvoiceDeliveryMethod;
  textRecipient: string;
  textBody: string;
  emailRecipient: string;
  emailCc: string;
  emailSubject: string;
  emailBody: string;
  isSending: boolean;
  error: string | null;
};

type PaymentRequestDialogState = {
  isRequestDialogOpen: boolean;
  isCreating: boolean;
  isSendDialogOpen: boolean;
  activeRequest: InvoicePaymentRequestRecord | null;
  isSending: boolean;
};

type ReceivePaymentDialogState = {
  isOpen: boolean;
  isSubmitting: boolean;
  defaults: { amount: number; paymentRequestId?: string | null };
  defaultReceiptBody: string;
};

type SendReceiptDialogState = {
  isOpen: boolean;
  activePayment: InvoicePaymentRecord | null;
  defaultBody: string;
  isSending: boolean;
};

type CancelRequestDialogState = {
  requestToCancel: InvoicePaymentRequestRecord | null;
  isCancelling: boolean;
};

type LineItemDialogState = {
  isOpen: boolean;
  editingItem: InvoiceLineItemRecord | null;
  isSubmitting: boolean;
  itemToDelete: InvoiceLineItemRecord | null;
  isDeleting: boolean;
};

type TemplateState = {
  invoiceTemplate: CommunicationTemplateSnapshot;
  paymentRequestTemplate: CommunicationTemplateSnapshot;
  paymentReceiptTemplate: CommunicationTemplateSnapshot;
  invoiceTemplateDefaults: { smsBody: string; emailSubject: string; emailBody: string };
  buildPaymentRequestDefaults: (request: InvoicePaymentRequestRecord) => {
    smsBody: string;
    emailSubject: string;
    emailBody: string;
  };
};

type InvoiceDetailContextValue = {
  // Props passed from parent
  companyId: string;
  companyName: string;
  companyEmail: string | null;
  dealId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;

  // State
  state: InvoiceState;
  computed: InvoiceComputed;
  templates: TemplateState;

  // Dialog states
  sendInvoiceDialog: SendInvoiceDialogState;
  paymentRequestDialog: PaymentRequestDialogState;
  receivePaymentDialog: ReceivePaymentDialogState;
  sendReceiptDialog: SendReceiptDialogState;
  cancelRequestDialog: CancelRequestDialogState;
  lineItemDialog: LineItemDialogState;

  // Actions - Send Invoice
  openSendInvoiceDialog: () => void;
  closeSendInvoiceDialog: () => void;
  setSendMethod: (method: InvoiceDeliveryMethod) => void;
  setTextRecipient: (value: string) => void;
  setTextBody: (value: string) => void;
  setEmailRecipient: (value: string) => void;
  setEmailCc: (value: string) => void;
  setEmailSubject: (value: string) => void;
  setEmailBody: (value: string) => void;
  handleSendInvoice: () => Promise<void>;

  // Actions - Payment Requests
  openRequestPaymentDialog: () => void;
  closeRequestPaymentDialog: () => void;
  handleCreatePaymentRequest: (input: { amount: number; note: string | null }) => Promise<void>;
  openSendPaymentRequestDialog: (request: InvoicePaymentRequestRecord) => void;
  closeSendPaymentRequestDialog: () => void;
  handleSendPaymentRequest: (payload: {
    method: InvoiceDeliveryMethod;
    text?: { to: string; body: string };
    email?: { to: string; cc?: string | null; subject: string; body: string };
  }) => Promise<void>;

  // Actions - Receive Payment
  openReceivePaymentDialog: (defaults?: { amount: number; paymentRequestId?: string | null }) => void;
  closeReceivePaymentDialog: () => void;
  handleReceivePayment: (input: {
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
  }) => Promise<void>;

  // Actions - Send Receipt
  openSendReceiptDialog: (payment: InvoicePaymentRecord) => void;
  closeSendReceiptDialog: () => void;
  handleSendPaymentReceipt: (input: {
    receiptEmail: string;
    receiptSubject: string;
    receiptBody: string;
  }) => Promise<void>;

  // Actions - Cancel Request
  openCancelRequestDialog: (request: InvoicePaymentRequestRecord) => void;
  closeCancelRequestDialog: () => void;
  confirmCancelPaymentRequest: () => Promise<void>;

  // Actions - Line Items
  openAddLineItemDialog: () => void;
  openEditLineItemDialog: (item: InvoiceLineItemRecord) => void;
  closeLineItemDialog: () => void;
  handleLineItemSubmit: (data: {
    name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
  }) => Promise<void>;
  openDeleteLineItemDialog: (item: InvoiceLineItemRecord) => void;
  closeDeleteLineItemDialog: () => void;
  confirmDeleteLineItem: () => Promise<void>;

  // Navigation
  handleBackToDeal: () => void;
};

// ============================================================================
// Context Creation
// ============================================================================

const InvoiceDetailContext = createContext<InvoiceDetailContextValue | null>(null);

// ============================================================================
// Hook to use context
// ============================================================================

export function useInvoiceDetailContext() {
  const context = useContext(InvoiceDetailContext);
  if (!context) {
    throw new Error("useInvoiceDetailContext must be used within an InvoiceDetailProvider");
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

type InvoiceDetailProviderProps = InvoiceDetailProps & {
  children: ReactNode;
};

export function InvoiceDetailProvider({
  children,
  companyId,
  companyName,
  companyEmail,
  dealId,
  invoice,
  paymentRequests,
  payments,
  clientName,
  clientEmail,
  clientPhone,
  invoiceTemplate,
  paymentRequestTemplate,
  paymentReceiptTemplate,
  isArchived = false,
}: InvoiceDetailProviderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invoiceDeliveryRepository = useMemo(() => createInvoiceDeliveryRepository(), []);
  const supabaseBrowserClient = useMemo(() => createSupabaseBrowserClient(), []);

  // ============================================================================
  // Template State
  // ============================================================================
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

  // ============================================================================
  // Core State
  // ============================================================================
  const [invoiceState, setInvoiceState] = useState<InvoiceRecord>(invoice);
  const [paymentRequestsState, setPaymentRequestsState] =
    useState<InvoicePaymentRequestRecord[]>(paymentRequests);
  const [paymentsState, setPaymentsState] = useState<InvoicePaymentRecord[]>(payments);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [defaultReceiptBody, setDefaultReceiptBody] = useState<string>(
    paymentReceiptTemplateSnapshot.emailBody
  );

  // ============================================================================
  // Computed Values
  // ============================================================================
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

    return paymentRequestsState
      .filter((request) => request.status !== "paid")
      .sort((a, b) => {
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
        clientName,
        invoiceNumber: invoiceState.invoice_number,
        invoiceUrl: invoiceShareUrl,
      }),
    [clientName, companyName, invoiceTemplateSnapshot, invoiceShareUrl, invoiceState.invoice_number]
  );

  const buildPaymentRequestDefaults = useCallback(
    (request: InvoicePaymentRequestRecord) =>
      buildPaymentRequestTemplateDefaults(paymentRequestTemplateSnapshot, {
        companyName,
        clientName,
        invoiceNumber: invoiceState.invoice_number,
        invoiceUrl: invoiceShareUrl,
        paymentAmount: formatCurrency(request.amount),
      }),
    [
      clientName,
      companyName,
      invoiceShareUrl,
      invoiceState.invoice_number,
      paymentRequestTemplateSnapshot,
    ]
  );

  const initialSendMethod: InvoiceDeliveryMethod = useMemo(() => {
    if (clientEmail && clientPhone) return "both";
    if (clientPhone) return "text";
    return "email";
  }, [clientEmail, clientPhone]);

  const totals = useMemo(() => {
    const lineTotal = invoiceState.line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    return {
      subtotal: lineTotal,
      total: invoiceState.total_amount ?? lineTotal,
      balance: invoiceState.balance_due ?? lineTotal,
    };
  }, [invoiceState]);

  // ============================================================================
  // Send Invoice Dialog State
  // ============================================================================
  const [isSendInvoiceDialogOpen, setIsSendInvoiceDialogOpen] = useState(false);
  const [invoiceSendMethod, setInvoiceSendMethod] =
    useState<InvoiceDeliveryMethod>(initialSendMethod);
  const [textRecipient, setTextRecipient] = useState(clientPhone);
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

  // ============================================================================
  // Payment Request Dialog State
  // ============================================================================
  const [isRequestPaymentDialogOpen, setIsRequestPaymentDialogOpen] = useState(false);
  const [isCreatingPaymentRequest, setIsCreatingPaymentRequest] = useState(false);
  const [isSendPaymentRequestDialogOpen, setIsSendPaymentRequestDialogOpen] = useState(false);
  const [activePaymentRequest, setActivePaymentRequest] =
    useState<InvoicePaymentRequestRecord | null>(null);
  const [isSendingPaymentRequest, setIsSendingPaymentRequest] = useState(false);

  // ============================================================================
  // Receive Payment Dialog State
  // ============================================================================
  const [isReceivePaymentDialogOpen, setIsReceivePaymentDialogOpen] = useState(false);
  const [receivePaymentSubmitting, setReceivePaymentSubmitting] = useState(false);
  const [receivePaymentDefaults, setReceivePaymentDefaults] = useState<{
    amount: number;
    paymentRequestId?: string | null;
  }>({ amount: invoiceState.balance_due, paymentRequestId: null });

  // ============================================================================
  // Send Receipt Dialog State
  // ============================================================================
  const [isSendReceiptDialogOpen, setIsSendReceiptDialogOpen] = useState(false);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<InvoicePaymentRecord | null>(
    null
  );
  const [sendReceiptDefaultBody, setSendReceiptDefaultBody] = useState<string>(
    paymentReceiptTemplateSnapshot.emailBody
  );
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);

  // ============================================================================
  // Cancel Request Dialog State
  // ============================================================================
  const [requestToCancel, setRequestToCancel] = useState<InvoicePaymentRequestRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // ============================================================================
  // Line Item Dialog State
  // ============================================================================
  const [isLineItemDialogOpen, setIsLineItemDialogOpen] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<InvoiceLineItemRecord | null>(null);
  const [isLineItemSubmitting, setIsLineItemSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InvoiceLineItemRecord | null>(null);
  const [isDeletingLineItem, setIsDeletingLineItem] = useState(false);

  // ============================================================================
  // Template Refresh Effects
  // ============================================================================
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
    return () => {
      cancelled = true;
    };
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
    return () => {
      cancelled = true;
    };
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
    return () => {
      cancelled = true;
    };
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

  // ============================================================================
  // Send Invoice Handlers
  // ============================================================================
  const handleTextBodyChange = useCallback((value: string) => {
    setTextBodyEdited(true);
    setTextBody(value);
  }, []);

  const handleEmailSubjectChange = useCallback((value: string) => {
    setEmailSubjectEdited(true);
    setEmailSubject(value);
  }, []);

  const handleEmailBodyChange = useCallback((value: string) => {
    setEmailBodyEdited(true);
    setEmailBody(value);
  }, []);

  const openSendInvoiceDialog = useCallback(() => {
    setIsSendInvoiceDialogOpen(true);
  }, []);

  const closeSendInvoiceDialog = useCallback(() => {
    setIsSendInvoiceDialogOpen(false);
  }, []);

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
        setInvoiceState((prev) => ({
          ...prev,
          status: response.invoiceStatus as InvoiceRecord["status"],
        }));
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
      setSendInvoiceError(
        (error as { message?: string })?.message ?? "We couldn't send the invoice."
      );
    } finally {
      setIsSendingInvoice(false);
    }
  }, [
    dealId,
    emailBody,
    emailCc,
    emailRecipient,
    emailSubject,
    invoiceDeliveryRepository,
    invoiceSendMethod,
    invoiceState.id,
    isSendingInvoice,
    textBody,
    textRecipient,
  ]);

  // ============================================================================
  // Payment Request Handlers
  // ============================================================================
  const openRequestPaymentDialog = useCallback(() => {
    setIsRequestPaymentDialogOpen(true);
  }, []);

  const closeRequestPaymentDialog = useCallback(() => {
    setIsRequestPaymentDialogOpen(false);
  }, []);

  const handleCreatePaymentRequest = useCallback(
    async ({ amount, note }: { amount: number; note: string | null }) => {
      setActionError(null);
      setIsCreatingPaymentRequest(true);
      try {
        const created = await createInvoicePaymentRequestApi(dealId, invoiceState.id, {
          amount,
          note,
        });
        setPaymentRequestsState((prev) => [created, ...prev]);
        setFlashMessage("Payment request created.");
        setIsRequestPaymentDialogOpen(false);
      } catch (error) {
        console.error("Failed to create payment request", error);
        setActionError(
          (error as { message?: string })?.message ?? "We couldn't create the payment request."
        );
      } finally {
        setIsCreatingPaymentRequest(false);
      }
    },
    [dealId, invoiceState.id]
  );

  const openSendPaymentRequestDialog = useCallback((request: InvoicePaymentRequestRecord) => {
    setActivePaymentRequest(request);
    setIsSendPaymentRequestDialogOpen(true);
  }, []);

  const closeSendPaymentRequestDialog = useCallback(() => {
    setIsSendPaymentRequestDialogOpen(false);
    setActivePaymentRequest(null);
  }, []);

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
        const templateVars = {
          company_name: companyName,
          companyName,
          customer_name: clientName,
          client_name: clientName,
          invoice_number: invoiceState.invoice_number,
          invoice_button: invoiceShareUrl ?? "",
          payment_amount: formatCurrency(activePaymentRequest.amount),
        };

        const renderedPayload: typeof payload = {
          method: payload.method,
          text:
            payload.text && (payload.method === "both" || payload.method === "text")
              ? {
                  to: payload.text.to,
                  body: renderCommunicationTemplate(payload.text.body, templateVars),
                }
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
          prev.map((request) =>
            request.id === data.paymentRequest.id ? data.paymentRequest : request
          )
        );

        setFlashMessage("Payment request sent.");
        setIsSendPaymentRequestDialogOpen(false);
        setActivePaymentRequest(null);
      } catch (error) {
        console.error("Failed to send payment request", error);
        setActionError(
          (error as { message?: string })?.message ?? "We couldn't send the payment request."
        );
      } finally {
        setIsSendingPaymentRequest(false);
      }
    },
    [
      activePaymentRequest,
      companyName,
      clientName,
      dealId,
      invoiceShareUrl,
      invoiceState.id,
      invoiceState.invoice_number,
    ]
  );

  // ============================================================================
  // Receive Payment Handlers
  // ============================================================================
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

  const closeReceivePaymentDialog = useCallback(() => {
    setIsReceivePaymentDialogOpen(false);
  }, []);

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

      const {
        data: { user },
      } = await supabaseBrowserClient.auth.getUser();
      if (!user) {
        setActionError("You must be signed in to record a payment.");
        return;
      }

      setReceivePaymentSubmitting(true);

      try {
        const [firstName, ...restName] = clientName.trim().split(" ");
        const templateVars = {
          company_name: companyName,
          companyName,
          customer_name: clientName,
          client_name: clientName,
          first_name: firstName || clientName || "Client",
          last_name: restName.join(" "),
          invoice_number: invoiceState.invoice_number,
          invoice_button: invoiceShareUrl ?? "",
          payment_amount: formatCurrency(input.amount),
        };

        const renderedInput = {
          ...input,
          receiptSubject:
            input.sendReceipt && input.receiptSubject
              ? renderCommunicationTemplate(input.receiptSubject, templateVars).trim()
              : input.receiptSubject,
          receiptBody:
            input.sendReceipt && input.receiptBody
              ? renderCommunicationTemplate(input.receiptBody, templateVars)
              : input.receiptBody,
        };

        const data = await apiClient<{
          invoice: InvoiceRecord | null;
          payments: InvoicePaymentRecord[];
          paymentRequests: InvoicePaymentRequestRecord[];
        }>(`/deals/${dealId}/invoices/${invoiceState.id}/payments`, {
          method: "POST",
          body: JSON.stringify(renderedInput),
        });

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
        setActionError(
          (error as { message?: string })?.message ?? "We couldn't record the payment."
        );
      } finally {
        setReceivePaymentSubmitting(false);
      }
    },
    [
      clientName,
      companyName,
      dealId,
      invoiceShareUrl,
      invoiceState.id,
      invoiceState.invoice_number,
      supabaseBrowserClient,
    ]
  );

  // ============================================================================
  // Send Receipt Handlers
  // ============================================================================
  const openSendReceiptDialog = useCallback(
    (payment: InvoicePaymentRecord) => {
      setActiveReceiptPayment(payment);
      setSendReceiptDefaultBody(paymentReceiptTemplate.emailBody);
      setIsSendReceiptDialogOpen(true);
    },
    [paymentReceiptTemplate.emailBody]
  );

  const closeSendReceiptDialog = useCallback(() => {
    setIsSendReceiptDialogOpen(false);
    setActiveReceiptPayment(null);
  }, []);

  const handleSendPaymentReceipt = useCallback(
    async (input: { receiptEmail: string; receiptSubject: string; receiptBody: string }) => {
      if (!activeReceiptPayment) return;

      setIsSendingReceipt(true);
      setActionError(null);

      try {
        const [firstName, ...restName] = clientName.trim().split(" ");
        const templateVars = {
          company_name: companyName,
          companyName,
          customer_name: clientName,
          client_name: clientName,
          first_name: firstName || clientName || "Client",
          last_name: restName.join(" "),
          invoice_number: invoiceState.invoice_number,
          invoice_button: invoiceShareUrl ?? "",
          payment_amount: formatCurrency(activeReceiptPayment.amount),
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
        setActionError(
          (error as { message?: string })?.message ?? "We couldn't send the payment confirmation."
        );
      } finally {
        setIsSendingReceipt(false);
      }
    },
    [
      activeReceiptPayment,
      clientName,
      companyName,
      dealId,
      invoiceShareUrl,
      invoiceState.id,
      invoiceState.invoice_number,
    ]
  );

  // ============================================================================
  // Cancel Request Handlers
  // ============================================================================
  const openCancelRequestDialog = useCallback((request: InvoicePaymentRequestRecord) => {
    setRequestToCancel(request);
  }, []);

  const closeCancelRequestDialog = useCallback(() => {
    setRequestToCancel(null);
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
      setActionError(
        (error as { message?: string })?.message ?? "We couldn't delete the payment request."
      );
    } finally {
      setIsCancelling(false);
    }
  }, [dealId, invoiceState.id, requestToCancel]);

  // ============================================================================
  // Line Item Handlers
  // ============================================================================
  const openAddLineItemDialog = useCallback(() => {
    setEditingLineItem(null);
    setIsLineItemDialogOpen(true);
  }, []);

  const openEditLineItemDialog = useCallback((item: InvoiceLineItemRecord) => {
    setEditingLineItem(item);
    setIsLineItemDialogOpen(true);
  }, []);

  const closeLineItemDialog = useCallback(() => {
    setIsLineItemDialogOpen(false);
    setEditingLineItem(null);
  }, []);

  const handleLineItemSubmit = useCallback(
    async (data: {
      name: string;
      description: string | null;
      quantity: number;
      unit_price: number;
    }) => {
      setActionError(null);
      setIsLineItemSubmitting(true);

      try {
        if (editingLineItem) {
          const result = await updateInvoiceLineItem(
            dealId,
            invoiceState.id,
            editingLineItem.id,
            data
          );
          setInvoiceState((prev) => ({
            ...prev,
            ...result.invoice,
            line_items: prev.line_items.map((item) =>
              item.id === result.lineItem.id ? result.lineItem : item
            ),
          }));
          setFlashMessage("Line item updated.");
        } else {
          const result = await addInvoiceLineItem(dealId, invoiceState.id, data);
          setInvoiceState((prev) => ({
            ...prev,
            ...result.invoice,
            line_items: [...prev.line_items, result.lineItem],
          }));
          setFlashMessage("Line item added.");
        }

        queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
        queryClient.invalidateQueries({
          queryKey: invoiceDetailKeys.detail(dealId, invoiceState.id),
        });

        setIsLineItemDialogOpen(false);
        setEditingLineItem(null);
      } catch (error) {
        console.error("Failed to save line item", error);
        setActionError(
          (error as { message?: string })?.message ?? "We couldn't save the line item."
        );
      } finally {
        setIsLineItemSubmitting(false);
      }
    },
    [dealId, editingLineItem, invoiceState.id, queryClient]
  );

  const openDeleteLineItemDialog = useCallback((item: InvoiceLineItemRecord) => {
    setItemToDelete(item);
  }, []);

  const closeDeleteLineItemDialog = useCallback(() => {
    setItemToDelete(null);
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

      queryClient.invalidateQueries({ queryKey: queryKeys.dealDetail.detail(dealId) });
      queryClient.invalidateQueries({
        queryKey: invoiceDetailKeys.detail(dealId, invoiceState.id),
      });
    } catch (error) {
      console.error("Failed to delete line item", error);
      setActionError(
        (error as { message?: string })?.message ?? "We couldn't delete the line item."
      );
    } finally {
      setIsDeletingLineItem(false);
    }
  }, [dealId, invoiceState.id, itemToDelete, queryClient]);

  // ============================================================================
  // Navigation
  // ============================================================================
  const handleBackToDeal = useCallback(() => {
    navigate(`/deals/${dealId}`);
  }, [dealId, navigate]);

  // ============================================================================
  // Context Value
  // ============================================================================
  const contextValue = useMemo<InvoiceDetailContextValue>(
    () => ({
      // Props
      companyId,
      companyName,
      companyEmail,
      dealId,
      clientName,
      clientEmail,
      clientPhone,

      // State
      state: {
        invoice: invoiceState,
        payments: paymentsState,
        paymentRequests: paymentRequestsState,
        flashMessage,
        actionError,
        isArchived,
      },
      computed: {
        hasOpenPaymentRequest,
        orderedPaymentRequests,
        invoiceShareUrl,
        totals,
      },
      templates: {
        invoiceTemplate: invoiceTemplateSnapshot,
        paymentRequestTemplate: paymentRequestTemplateSnapshot,
        paymentReceiptTemplate: paymentReceiptTemplateSnapshot,
        invoiceTemplateDefaults,
        buildPaymentRequestDefaults,
      },

      // Dialog states
      sendInvoiceDialog: {
        isOpen: isSendInvoiceDialogOpen,
        method: invoiceSendMethod,
        textRecipient,
        textBody,
        emailRecipient,
        emailCc,
        emailSubject,
        emailBody,
        isSending: isSendingInvoice,
        error: sendInvoiceError,
      },
      paymentRequestDialog: {
        isRequestDialogOpen: isRequestPaymentDialogOpen,
        isCreating: isCreatingPaymentRequest,
        isSendDialogOpen: isSendPaymentRequestDialogOpen,
        activeRequest: activePaymentRequest,
        isSending: isSendingPaymentRequest,
      },
      receivePaymentDialog: {
        isOpen: isReceivePaymentDialogOpen,
        isSubmitting: receivePaymentSubmitting,
        defaults: receivePaymentDefaults,
        defaultReceiptBody,
      },
      sendReceiptDialog: {
        isOpen: isSendReceiptDialogOpen,
        activePayment: activeReceiptPayment,
        defaultBody: sendReceiptDefaultBody,
        isSending: isSendingReceipt,
      },
      cancelRequestDialog: {
        requestToCancel,
        isCancelling,
      },
      lineItemDialog: {
        isOpen: isLineItemDialogOpen,
        editingItem: editingLineItem,
        isSubmitting: isLineItemSubmitting,
        itemToDelete,
        isDeleting: isDeletingLineItem,
      },

      // Actions - Send Invoice
      openSendInvoiceDialog,
      closeSendInvoiceDialog,
      setSendMethod: setInvoiceSendMethod,
      setTextRecipient,
      setTextBody: handleTextBodyChange,
      setEmailRecipient,
      setEmailCc,
      setEmailSubject: handleEmailSubjectChange,
      setEmailBody: handleEmailBodyChange,
      handleSendInvoice,

      // Actions - Payment Requests
      openRequestPaymentDialog,
      closeRequestPaymentDialog,
      handleCreatePaymentRequest,
      openSendPaymentRequestDialog,
      closeSendPaymentRequestDialog,
      handleSendPaymentRequest,

      // Actions - Receive Payment
      openReceivePaymentDialog,
      closeReceivePaymentDialog,
      handleReceivePayment,

      // Actions - Send Receipt
      openSendReceiptDialog,
      closeSendReceiptDialog,
      handleSendPaymentReceipt,

      // Actions - Cancel Request
      openCancelRequestDialog,
      closeCancelRequestDialog,
      confirmCancelPaymentRequest,

      // Actions - Line Items
      openAddLineItemDialog,
      openEditLineItemDialog,
      closeLineItemDialog,
      handleLineItemSubmit,
      openDeleteLineItemDialog,
      closeDeleteLineItemDialog,
      confirmDeleteLineItem,

      // Navigation
      handleBackToDeal,
    }),
    [
      companyId,
      companyName,
      companyEmail,
      dealId,
      clientName,
      clientEmail,
      clientPhone,
      invoiceState,
      paymentsState,
      paymentRequestsState,
      flashMessage,
      actionError,
      isArchived,
      hasOpenPaymentRequest,
      orderedPaymentRequests,
      invoiceShareUrl,
      totals,
      invoiceTemplateSnapshot,
      paymentRequestTemplateSnapshot,
      paymentReceiptTemplateSnapshot,
      invoiceTemplateDefaults,
      buildPaymentRequestDefaults,
      isSendInvoiceDialogOpen,
      invoiceSendMethod,
      textRecipient,
      textBody,
      emailRecipient,
      emailCc,
      emailSubject,
      emailBody,
      isSendingInvoice,
      sendInvoiceError,
      isRequestPaymentDialogOpen,
      isCreatingPaymentRequest,
      isSendPaymentRequestDialogOpen,
      activePaymentRequest,
      isSendingPaymentRequest,
      isReceivePaymentDialogOpen,
      receivePaymentSubmitting,
      receivePaymentDefaults,
      defaultReceiptBody,
      isSendReceiptDialogOpen,
      activeReceiptPayment,
      sendReceiptDefaultBody,
      isSendingReceipt,
      requestToCancel,
      isCancelling,
      isLineItemDialogOpen,
      editingLineItem,
      isLineItemSubmitting,
      itemToDelete,
      isDeletingLineItem,
      openSendInvoiceDialog,
      closeSendInvoiceDialog,
      handleTextBodyChange,
      handleEmailSubjectChange,
      handleEmailBodyChange,
      handleSendInvoice,
      openRequestPaymentDialog,
      closeRequestPaymentDialog,
      handleCreatePaymentRequest,
      openSendPaymentRequestDialog,
      closeSendPaymentRequestDialog,
      handleSendPaymentRequest,
      openReceivePaymentDialog,
      closeReceivePaymentDialog,
      handleReceivePayment,
      openSendReceiptDialog,
      closeSendReceiptDialog,
      handleSendPaymentReceipt,
      openCancelRequestDialog,
      closeCancelRequestDialog,
      confirmCancelPaymentRequest,
      openAddLineItemDialog,
      openEditLineItemDialog,
      closeLineItemDialog,
      handleLineItemSubmit,
      openDeleteLineItemDialog,
      closeDeleteLineItemDialog,
      confirmDeleteLineItem,
      handleBackToDeal,
    ]
  );

  return (
    <InvoiceDetailContext.Provider value={contextValue}>{children}</InvoiceDetailContext.Provider>
  );
}
