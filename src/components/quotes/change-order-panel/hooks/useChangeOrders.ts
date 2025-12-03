import { useCallback, useState } from "react";
import type { ChangeOrderRecord } from "@/types/change-orders";
import {
  useChangeOrders as useChangeOrdersQuery,
  useAcceptChangeOrder,
} from "@/hooks/useChangeOrders";
import { useInvoiceByQuote } from "@/hooks/useInvoices";

type UseChangeOrdersOptions = {
  dealId: string;
  quoteId?: string;
};

export function useChangeOrders({ dealId, quoteId }: UseChangeOrdersOptions) {
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Use React Query for change orders
  const {
    data: changeOrders = [],
    isLoading,
    error: loadErrorObj,
    refetch: refetchChangeOrders,
  } = useChangeOrdersQuery(dealId);

  // Use React Query for invoice
  const { data: quoteInvoice = null } = useInvoiceByQuote(quoteId);

  const loadError = loadErrorObj instanceof Error ? loadErrorObj.message : null;

  // Mutation for accepting change orders
  const acceptMutation = useAcceptChangeOrder(dealId);

  const loadChangeOrders = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      // React Query handles loading state automatically
      // This function is kept for backwards compatibility
      await refetchChangeOrders();
    },
    [refetchChangeOrders]
  );

  const handleAcceptExisting = useCallback(
    async (id: string) => {
      if (!quoteInvoice) {
        setError("Invoice not found for this proposal. Accept the proposal to generate its invoice.");
        return;
      }

      try {
        setAcceptingId(id);
        setError(null);
        setMessage(null);
        await acceptMutation.mutateAsync({
          changeOrderId: id,
          payload: { invoice_id: quoteInvoice.id },
        });
        setMessage("Change order accepted and added to the invoice.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept change order.");
      } finally {
        setAcceptingId(null);
      }
    },
    [quoteInvoice, acceptMutation]
  );

  const updateChangeOrdersLocally = useCallback((saved: ChangeOrderRecord) => {
    // With React Query, we don't need to manually update state
    // The cache is automatically invalidated after mutations
    // This function is kept for backwards compatibility with the draft hook
  }, []);

  return {
    changeOrders,
    setChangeOrders: () => {}, // No-op, React Query manages state
    quoteInvoice,
    isLoading,
    loadError,
    acceptingId,
    setAcceptingId,
    error,
    setError,
    message,
    setMessage,
    loadChangeOrders,
    handleAcceptExisting,
    updateChangeOrdersLocally,
  };
}
