import type { ProductTemplateType } from "@/types/product-templates";

export const PRODUCT_TEMPLATE_FIELDS = [
  "id",
  "company_id",
  "created_by_user_id",
  "name",
  "description",
  "type",
  "created_at",
  "updated_at",
].join(", " );

export const PRODUCT_TEMPLATE_TYPE_OPTIONS: readonly { value: ProductTemplateType; label: string }[] = [
  { value: "service", label: "Service" },
  { value: "product", label: "Product" },
] as const;
