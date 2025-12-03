import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  listChangeOrders,
  createChangeOrder,
  acceptChangeOrder,
  deleteChangeOrder,
} from '@/services/change-orders';
import type { ChangeOrderRecord } from '@/types/change-orders';

type CreateChangeOrderPayload = {
  company_id: string;
  deal_id: string;
  quote_id: string;
  invoice_id?: string | null;
  change_order_number: string;
  items: Array<{
    name: string;
    description?: string | null;
    quantity?: number;
    unit_price?: number;
    unitPrice?: number;
    position?: number;
  }>;
};

type AcceptChangeOrderPayload = {
  invoice_id?: string | null;
  signer_name?: string;
  signer_email?: string;
  signature_text?: string;
};

export function useChangeOrders(dealId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.changeOrders.list(dealId!),
    queryFn: () => listChangeOrders(dealId!),
    enabled: !!dealId,
  });
}

export function useCreateChangeOrder(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChangeOrderPayload) => createChangeOrder(payload),
    onSuccess: (savedChangeOrder) => {
      // Optimistically update the cache with the saved change order
      queryClient.setQueryData<ChangeOrderRecord[]>(
        queryKeys.changeOrders.list(dealId),
        (old = []) => {
          const filtered = old.filter((order) => order.id !== savedChangeOrder.id);
          return [...filtered, savedChangeOrder];
        }
      );
      // Invalidate related queries in the background
      queryClient.invalidateQueries({ queryKey: queryKeys.deals.detail(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.byDeal(dealId) });
    },
  });
}

export function useAcceptChangeOrder(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      changeOrderId,
      payload,
    }: {
      changeOrderId: string;
      payload: AcceptChangeOrderPayload;
    }) => acceptChangeOrder(changeOrderId, payload),
    onSuccess: (savedChangeOrder) => {
      // Optimistically update the cache with the accepted change order
      queryClient.setQueryData<ChangeOrderRecord[]>(
        queryKeys.changeOrders.list(dealId),
        (old = []) => {
          return old.map((order) =>
            order.id === savedChangeOrder.id ? savedChangeOrder : order
          );
        }
      );
      // Invalidate invoice queries in the background (balance changed)
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.byDeal(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}

export function useDeleteChangeOrder(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changeOrderId: string) => deleteChangeOrder(changeOrderId),
    onMutate: async (changeOrderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.changeOrders.list(dealId) });

      // Snapshot previous value
      const previousChangeOrders = queryClient.getQueryData<ChangeOrderRecord[]>(
        queryKeys.changeOrders.list(dealId)
      );

      // Optimistically remove the change order
      queryClient.setQueryData<ChangeOrderRecord[]>(
        queryKeys.changeOrders.list(dealId),
        (old = []) => old.filter((order) => order.id !== changeOrderId)
      );

      return { previousChangeOrders };
    },
    onError: (_err, _changeOrderId, context) => {
      // Rollback on error
      if (context?.previousChangeOrders) {
        queryClient.setQueryData(
          queryKeys.changeOrders.list(dealId),
          context.previousChangeOrders
        );
      }
    },
  });
}
