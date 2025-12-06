import { useCallback, useState } from "react";
import type {
  QuoteRecord,
  QuoteDeliveryMethod,
  QuoteDeliveryRequestPayload,
} from "@/features/quotes";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import { sendQuoteDelivery } from "@/features/quotes";
import { renderCommunicationTemplate } from "@/features/communications";
import { getBrowserProposalShareUrl } from "@/lib/proposal-share";
import type { QuoteCompanyBranding } from "@/types/company-branding";
import { buildProposalTemplateDefaults } from "../utils";

type UseQuoteSendProps = {
  dealId: string;
  quoteId: string | undefined;
  publicShareId: string | null;
  status: QuoteRecord["status"];
  setStatus: (status: QuoteRecord["status"]) => void;
  companyName: string;
  companyBranding: QuoteCompanyBranding;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  quoteNumber: string;
  defaultQuoteNumber: string;
  proposalTemplate: CommunicationTemplateSnapshot;
  changeOrderTemplate: CommunicationTemplateSnapshot;
  origin?: string;
  handleSaveQuote: () => Promise<QuoteRecord | null>;
};

export function useQuoteSend({
  dealId,
  quoteId,
  publicShareId,
  status,
  setStatus,
  companyName,
  companyBranding,
  clientName,
  clientEmail,
  clientPhone,
  quoteNumber,
  defaultQuoteNumber,
  proposalTemplate,
  changeOrderTemplate,
  origin,
  handleSaveQuote,
}: UseQuoteSendProps) {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendContext, setSendContext] = useState<"proposal" | "change_order">("proposal");
  const [sendMethod, setSendMethod] = useState<QuoteDeliveryMethod>("both");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [textRecipient, setTextRecipient] = useState(() => clientPhone?.trim() || "");
  const [textBody, setTextBody] = useState("");
  const [activeChangeOrderNumber, setActiveChangeOrderNumber] = useState<string | null>(null);
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  const handleOpenSendDialog = useCallback(
    (options?: { variant?: "proposal" | "change_order"; changeOrderNumber?: string | null }) => {
      const variant = options?.variant ?? "proposal";
      const template = variant === "change_order" ? changeOrderTemplate : proposalTemplate;
      const shareUrl = getBrowserProposalShareUrl(publicShareId, origin);
      const activeQuoteNumber = quoteNumber?.trim() || defaultQuoteNumber;

      const renderedDefaults = buildProposalTemplateDefaults(template, {
        companyName,
        companyPhone: companyBranding?.phone,
        companyWebsite: companyBranding?.website,
        clientName,
        quoteNumber: activeQuoteNumber,
        proposalUrl: shareUrl,
        changeOrderNumber: options?.changeOrderNumber ?? null,
      });

      setSendContext(variant);
      setActiveChangeOrderNumber(options?.changeOrderNumber ?? null);
      setEmailRecipient(clientEmail);
      setEmailCc("");
      setEmailSubject(renderedDefaults.emailSubject || "");
      setEmailBody(renderedDefaults.emailBody || "");
      setTextRecipient(clientPhone?.trim() || "");
      setTextBody(renderedDefaults.smsBody || "");
      setSendError(null);
      setSendSuccessMessage(null);
      setIsSendDialogOpen(true);
    },
    [changeOrderTemplate, clientEmail, clientName, clientPhone, companyBranding?.phone, companyBranding?.website, companyName, defaultQuoteNumber, origin, proposalTemplate, publicShareId, quoteNumber]
  );

  const handleCloseSendDialog = useCallback(() => {
    setIsSendDialogOpen(false);
    setIsSendingProposal(false);
    setSendContext("proposal");
    setActiveChangeOrderNumber(null);
    setSendError(null);
  }, []);

  const handleSendProposal = useCallback(async () => {
    setIsSendingProposal(true);
    setSendError(null);
    setSendSuccessMessage(null);

    try {
      let effectiveQuoteId = quoteId;

      if (!effectiveQuoteId) {
        const saved = await handleSaveQuote();
        effectiveQuoteId = saved?.id;
      }

      if (!effectiveQuoteId) {
        setSendError("Save the quote before sending it.");
        setIsSendingProposal(false);
        return;
      }

      const shouldSendEmail = sendMethod === "email" || sendMethod === "both";
      const shouldSendText = sendMethod === "text" || sendMethod === "both";

      if (shouldSendEmail && (!emailRecipient.trim() || !emailSubject.trim() || !emailBody.trim())) {
        setSendError("Email delivery requires recipient, subject, and body.");
        setIsSendingProposal(false);
        return;
      }

      if (shouldSendText && (!textRecipient.trim() || !textBody.trim())) {
        setSendError("SMS delivery requires recipient phone and message.");
        setIsSendingProposal(false);
        return;
      }

      if (!shouldSendEmail && !shouldSendText) {
        setSendError("Select at least one delivery method.");
        setIsSendingProposal(false);
        return;
      }

      const shareUrl = getBrowserProposalShareUrl(publicShareId, origin);
      const [firstName, ...restName] = clientName.trim().split(" ");
      const lastName = restName.join(" ");
      const activeQuoteNumber = quoteNumber?.trim() || defaultQuoteNumber;
      const activeTemplate = sendContext === "change_order" ? changeOrderTemplate : proposalTemplate;

      const templateVars = {
        company_name: companyName,
        companyName,
        company_phone: companyBranding?.phone ?? "",
        companyPhone: companyBranding?.phone ?? "",
        company_website: companyBranding?.website ?? "",
        companyWebsite: companyBranding?.website ?? "",
        customer_name: clientName,
        client_name: clientName,
        first_name: firstName || clientName || "Client",
        last_name: lastName,
        quote_number: activeQuoteNumber,
        proposal_button: shareUrl ?? "",
        change_order_number: activeChangeOrderNumber ?? "",
        change_order_button: shareUrl ?? "",
      };

      const renderedEmailSubject = shouldSendEmail
        ? renderCommunicationTemplate(emailSubject.trim() || activeTemplate.emailSubject || "", templateVars)
        : "";
      const renderedEmailBody = shouldSendEmail
        ? renderCommunicationTemplate(emailBody || activeTemplate.emailBody || "", templateVars)
        : "";
      const renderedSmsBody = shouldSendText
        ? renderCommunicationTemplate(textBody || activeTemplate.smsBody || "", templateVars)
        : "";

      const payload: QuoteDeliveryRequestPayload = {
        method: sendMethod,
        email: shouldSendEmail
          ? {
              to: emailRecipient.trim(),
              cc: emailCc.trim() || null,
              subject: renderedEmailSubject.trim(),
              body: renderedEmailBody,
            }
          : undefined,
        text: shouldSendText
          ? {
              to: textRecipient.trim(),
              body: renderedSmsBody,
            }
          : undefined,
      };

      const data = await sendQuoteDelivery(dealId, effectiveQuoteId, payload);

      if (data && "quoteStatus" in data && typeof data.quoteStatus === "string" && data.quoteStatus !== status) {
        setStatus(data.quoteStatus as QuoteRecord["status"]);
      } else if (status === "draft") {
        setStatus("sent");
      }

      const sentEmail = Boolean(data && "sentEmail" in data && data.sentEmail);
      const sentText = Boolean(data && "sentText" in data && data.sentText);

      const successLabel = sendContext === "change_order" ? "Change order" : "Proposal";
      const successMessage =
        sentEmail && sentText
          ? `${successLabel} emailed and texted to the customer.`
          : sentText
            ? `${successLabel} texted to the customer.`
            : `${successLabel} emailed to the customer.`;

      setSendSuccessMessage(successMessage);
      setIsSendDialogOpen(false);
    } catch (error) {
      console.error("Failed to send proposal", error);
      setSendSuccessMessage(null);
      setSendError(error instanceof Error ? error.message : "We couldn't send this proposal. Please try again.");
    } finally {
      setIsSendingProposal(false);
    }
  }, [
    activeChangeOrderNumber,
    changeOrderTemplate,
    companyBranding?.phone,
    companyBranding?.website,
    companyName,
    clientName,
    defaultQuoteNumber,
    dealId,
    emailBody,
    emailCc,
    emailRecipient,
    emailSubject,
    handleSaveQuote,
    proposalTemplate,
    origin,
    publicShareId,
    sendContext,
    quoteNumber,
    quoteId,
    sendMethod,
    setStatus,
    status,
    textBody,
    textRecipient,
  ]);

  return {
    isSendDialogOpen,
    sendContext,
    sendMethod,
    setSendMethod,
    emailRecipient,
    setEmailRecipient,
    emailCc,
    setEmailCc,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    textRecipient,
    setTextRecipient,
    textBody,
    setTextBody,
    activeChangeOrderNumber,
    isSendingProposal,
    sendError,
    sendSuccessMessage,
    handleOpenSendDialog,
    handleCloseSendDialog,
    handleSendProposal,
  };
}
