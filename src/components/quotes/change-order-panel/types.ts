import type { ProductTemplateRecord } from "@/features/products";
import type { ChangeOrderRecord } from "@/types/change-orders";
import type { InvoiceRecord } from "@/features/invoices";

export type ChangeOrderItem = {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
};

export type MoneyItem = {
  unit_price?: number;
  unitPrice?: number;
};

export type ChangeOrderPanelProps = {
  companyId: string;
  dealId: string;
  quoteId?: string;
  quoteNumber: string;
  taxRate: number;
  productTemplateOptions: ProductTemplateRecord[];
  customerViewUrl: string | null;
  onSendChangeOrder: (changeOrderNumber: string) => void;
};

export type ChangeOrderCardProps = {
  order: ChangeOrderRecord;
  taxRate: number;
  acceptingId: string | null;
  quoteInvoice: InvoiceRecord | null;
  onAccept: (id: string) => Promise<void>;
};

export type ChangeOrderTableProps = {
  items: Array<{
    id: string;
    name: string;
    description?: string | null;
    unit_price?: number;
    unitPrice?: number;
    quantity?: number;
  }>;
  taxRate: number;
  showActions?: boolean;
  onEditItem?: (item: ChangeOrderItem) => void;
  onDeleteItem?: (itemId: string) => void;
};

export type ChangeOrderItemFormProps = {
  name: string;
  description: string;
  unitPrice: string;
  editingItemId: string | null;
  isSaving: boolean;
  productTemplateOptions: ProductTemplateRecord[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUnitPriceChange: (value: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export type DraftChangeOrderSectionProps = {
  items: ChangeOrderItem[];
  activeLabel: string;
  quoteId?: string;
  taxRate: number;
  showForm: boolean;
  message: string | null;
  error: string | null;
  isSaving: boolean;
  hasDraftItems: boolean;
  hasPendingDraft: boolean;
  draftChangeOrderId: string | null;
  acceptingId: string | null;
  quoteInvoice: InvoiceRecord | null;
  productTemplateOptions: ProductTemplateRecord[];
  formState: {
    name: string;
    description: string;
    unitPrice: string;
    editingItemId: string | null;
  };
  onShowForm: () => void;
  onHideForm: () => void;
  onFormChange: (field: "name" | "description" | "unitPrice", value: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onSaveItem: () => void;
  onEditItem: (item: ChangeOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSendChangeOrder: () => void;
  onAcceptDraft: () => void;
};
