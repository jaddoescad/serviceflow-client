import { apiClient } from "@/services/api";
import type {
  ProductTemplateRecord,
  CreateProductTemplateInput,
  UpdateProductTemplateInput,
} from "./types";

export const listProductTemplatesForCompany = async (
  companyId: string
): Promise<ProductTemplateRecord[]> => {
  return apiClient<ProductTemplateRecord[]>("/product-templates", {
    params: { company_id: companyId },
  });
};

export const createProductTemplate = async (
  data: CreateProductTemplateInput
): Promise<ProductTemplateRecord> => {
  const payload = {
    company_id: data.companyId,
    name: data.name,
    description: data.description ?? null,
    type: data.type,
  };

  return apiClient<ProductTemplateRecord>("/product-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateProductTemplate = async (
  id: string,
  data: UpdateProductTemplateInput
): Promise<ProductTemplateRecord> => {
  const payload = {
    name: data.name,
    description: data.description ?? null,
    type: data.type,
  };

  return apiClient<ProductTemplateRecord>(`/product-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteProductTemplate = async (id: string): Promise<void> => {
  return apiClient<void>(`/product-templates/${id}`, {
    method: "DELETE",
  });
};

export const reorderProductTemplates = async (data: {
  companyId: string;
  order: Array<{ id: string; position: number }>;
}): Promise<void> => {
  return apiClient<void>(`/product-templates/reorder`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};
