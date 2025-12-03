export type ProductTemplateType = "service" | "product";

export type ProductTemplateRecord = {
  id: string;
  company_id: string;
  created_by_user_id: string;
  name: string;
  description: string | null;
  type: ProductTemplateType;
  created_at: string;
  updated_at: string;
};

export type ProductTemplateWithMeta = ProductTemplateRecord & {
  created_by_member?: {
    id: string;
    user_id: string;
    display_name: string | null;
    email: string | null;
  } | null;
};

export type CreateProductTemplateInput = {
  companyId: string;
  name: string;
  description?: string | null;
  type: ProductTemplateType;
};

export type UpdateProductTemplateInput = {
  name: string;
  description?: string | null;
  type: ProductTemplateType;
};

export type ProductTemplateSearchFilters = {
  search?: string;
  type?: ProductTemplateType | "all";
};
