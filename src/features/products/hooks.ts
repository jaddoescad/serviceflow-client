import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "./query-keys";
import {
  listProductTemplatesForCompany,
  createProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
  reorderProductTemplates,
} from "./api";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/errors";
import type { CreateProductTemplateInput, UpdateProductTemplateInput } from "./types";

export function useProducts(companyId: string | undefined) {
  return useQuery({
    queryKey: productKeys.list(companyId!),
    queryFn: () => listProductTemplatesForCompany(companyId!),
    enabled: !!companyId,
  });
}

export function useCreateProduct(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateProductTemplateInput) => createProductTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(companyId) });
      toast.success('Product created', 'The product has been created successfully.');
    },
    onError: (error) => {
      toast.error('Failed to create product', getErrorMessage(error));
    },
  });
}

export function useUpdateProduct(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductTemplateInput;
    }) => updateProductTemplate(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(companyId) });
      toast.success('Product updated', 'The product has been updated successfully.');
    },
    onError: (error) => {
      toast.error('Failed to update product', getErrorMessage(error));
    },
  });
}

export function useDeleteProduct(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (productId: string) => deleteProductTemplate(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(companyId) });
      toast.success('Product deleted', 'The product has been deleted.');
    },
    onError: (error) => {
      toast.error('Failed to delete product', getErrorMessage(error));
    },
  });
}

export function useReorderProducts(companyId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (order: Array<{ id: string; position: number }>) =>
      reorderProductTemplates({ companyId, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.list(companyId) });
    },
    onError: (error) => {
      toast.error('Failed to reorder products', getErrorMessage(error));
    },
  });
}
