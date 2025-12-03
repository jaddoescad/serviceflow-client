import { useCallback, useMemo, useState } from "react";
import { createWorkOrderDeliveryRepository } from "@/services/work-order-delivery";
import type { WorkOrderDeliveryMethod, WorkOrderDeliveryRequestPayload } from "@/types/work-order-delivery";
import type { CommunicationTemplateSnapshot } from "@/features/communications";
import {
  getBrowserSecretWorkOrderShareUrl,
  getBrowserWorkOrderShareUrl,
} from "@/lib/work-order-share";
import { buildWorkOrderTemplateDefaults } from "../utils";

type WorkOrderDialogContext = {
  method: WorkOrderDeliveryMethod;
  variant: "standard" | "secret";
};

type UseWorkOrderSendProps = {
  dealId: string;
  quoteId: string | undefined;
  publicShareId: string | null;
  companyName: string;
  clientName: string;
  quoteNumber: string;
  defaultQuoteNumber: string;
  propertyAddress: string;
  workOrderTemplate: CommunicationTemplateSnapshot;
  origin?: string;
};

export function useWorkOrderSend({
  dealId,
  quoteId,
  publicShareId,
  companyName,
  clientName,
  quoteNumber,
  defaultQuoteNumber,
  propertyAddress,
  workOrderTemplate,
  origin,
}: UseWorkOrderSendProps) {
  const workOrderDeliveryRepository = useMemo(() => createWorkOrderDeliveryRepository(), []);

  const [workOrderDialogState, setWorkOrderDialogState] = useState<WorkOrderDialogContext | null>(null);
  const [isSendingWorkOrder, setIsSendingWorkOrder] = useState(false);
  const [workOrderSendError, setWorkOrderSendError] = useState<string | null>(null);
  const [workOrderSendSuccess, setWorkOrderSendSuccess] = useState<string | null>(null);

  const workOrderShareUrl = useMemo(
    () => getBrowserWorkOrderShareUrl(publicShareId, origin),
    [publicShareId, origin]
  );

  const secretWorkOrderShareUrl = useMemo(
    () => getBrowserSecretWorkOrderShareUrl(publicShareId, origin),
    [publicShareId, origin]
  );

  const workOrderStandardDefaults = useMemo(() => {
    return buildWorkOrderTemplateDefaults(workOrderTemplate, {
      companyName,
      clientName,
      quoteNumber: quoteNumber || defaultQuoteNumber,
      workOrderUrl: workOrderShareUrl,
      workOrderAddress: propertyAddress,
    });
  }, [
    workOrderTemplate,
    companyName,
    clientName,
    quoteNumber,
    defaultQuoteNumber,
    workOrderShareUrl,
    propertyAddress,
  ]);

  const workOrderSecretDefaults = useMemo(() => {
    return buildWorkOrderTemplateDefaults(workOrderTemplate, {
      companyName,
      clientName,
      quoteNumber: quoteNumber || defaultQuoteNumber,
      workOrderUrl: secretWorkOrderShareUrl,
      workOrderAddress: propertyAddress,
    });
  }, [
    workOrderTemplate,
    companyName,
    clientName,
    quoteNumber,
    defaultQuoteNumber,
    secretWorkOrderShareUrl,
    propertyAddress,
  ]);

  const currentWorkOrderDefaults = workOrderDialogState?.variant === "secret"
    ? workOrderSecretDefaults
    : workOrderStandardDefaults;

  const currentWorkOrderUrl = workOrderDialogState?.variant === "secret"
    ? secretWorkOrderShareUrl
    : workOrderShareUrl;

  const handleWorkOrderSendRequest = useCallback(
    (options: { method: WorkOrderDeliveryMethod; variant: "standard" | "secret" }) => {
      if (!quoteId) {
        setWorkOrderSendError("Save the quote before sending a work order.");
        setWorkOrderSendSuccess(null);
        return;
      }

      setWorkOrderDialogState(options);
      setWorkOrderSendError(null);
      setWorkOrderSendSuccess(null);
    },
    [quoteId]
  );

  const handleWorkOrderDeliverySubmit = useCallback(
    async (payload: WorkOrderDeliveryRequestPayload) => {
      if (!quoteId) {
        setWorkOrderSendError("Save the quote before sending a work order.");
        return;
      }

      setIsSendingWorkOrder(true);
      setWorkOrderSendError(null);

      try {
        await workOrderDeliveryRepository.sendWorkOrder({
          dealId,
          quoteId,
          ...payload,
        });

        const channelLabel = payload.method === "email" ? "emailed" : payload.method === "text" ? "sent via SMS" : "sent";
        const variantLabel = payload.variant === "secret" ? "Secret work order" : "Work order";
        setWorkOrderSendSuccess(`${variantLabel} ${channelLabel}.`);
        setWorkOrderDialogState(null);
      } catch (error) {
        setWorkOrderSendError(error instanceof Error ? error.message : "Failed to send work order.");
        setWorkOrderSendSuccess(null);
      } finally {
        setIsSendingWorkOrder(false);
      }
    },
    [dealId, quoteId, workOrderDeliveryRepository]
  );

  const closeWorkOrderDialog = useCallback(() => {
    setWorkOrderDialogState(null);
  }, []);

  return {
    workOrderDialogState,
    isSendingWorkOrder,
    workOrderSendError,
    workOrderSendSuccess,
    workOrderShareUrl,
    secretWorkOrderShareUrl,
    currentWorkOrderDefaults,
    currentWorkOrderUrl,
    handleWorkOrderSendRequest,
    handleWorkOrderDeliverySubmit,
    closeWorkOrderDialog,
  };
}
