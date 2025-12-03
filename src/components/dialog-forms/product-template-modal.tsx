"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui/library";
import { PRODUCT_TEMPLATE_TYPE_OPTIONS } from "@/features/products";
import type {
  CreateProductTemplateInput,
  ProductTemplateRecord,
  ProductTemplateType,
  UpdateProductTemplateInput,
} from "@/features/products";
import type { CompanyMemberRecord } from "@/features/companies";
import { createProductTemplate, deleteProductTemplate, updateProductTemplate } from "@/features/products";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";

export type ProductTemplateModalMode = "create" | "edit";

type ProductTemplateModalProps = {
  companyId: string;
  mode: ProductTemplateModalMode;
  open: boolean;
  template?: ProductTemplateRecord | null;
  author?: CompanyMemberRecord | null;
  onClose: () => void;
  onSubmitSuccess: (template: ProductTemplateRecord) => void;
  onDeleteSuccess?: (templateId: string) => void;
};

type ProductTemplateFormValues = {
  name: string;
  description: string;
  type: ProductTemplateType;
};

const EMPTY_FORM_VALUES: ProductTemplateFormValues = {
  name: "",
  description: "",
  type: "service",
};

function toFormValues(template: ProductTemplateRecord | null | undefined): ProductTemplateFormValues {
  if (!template) {
    return EMPTY_FORM_VALUES;
  }

  return {
    name: template.name,
    description: template.description ?? "",
    type: template.type,
  } satisfies ProductTemplateFormValues;
}

function buildCreatePayload(
  companyId: string,
  values: ProductTemplateFormValues
): CreateProductTemplateInput {
  return {
    companyId,
    name: values.name,
    description: values.description,
    type: values.type,
  } satisfies CreateProductTemplateInput;
}

function buildUpdatePayload(values: ProductTemplateFormValues): UpdateProductTemplateInput {
  return {
    name: values.name,
    description: values.description,
    type: values.type,
  } satisfies UpdateProductTemplateInput;
}

export function ProductTemplateModal(props: ProductTemplateModalProps) {
  const { companyId, mode, open, template = null, author = null, onClose, onSubmitSuccess, onDeleteSuccess } = props;
  const supabase = useSupabaseBrowserClient();

  const [values, setValues] = useState<ProductTemplateFormValues>(() => toFormValues(template));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(toFormValues(template));
      setFormError(null);
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  }, [open, template]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || isDeleting) {
      return;
    }

    if (!values.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (mode === "create") {
        const created = await createProductTemplate(buildCreatePayload(companyId, values));
        onSubmitSuccess(created);
        onClose();
        return;
      }

      if (!template) {
        setFormError("No template selected to update.");
        return;
      }

      const updated = await updateProductTemplate(template.id, buildUpdatePayload(values));
      onSubmitSuccess(updated);
      onClose();
    } catch (error) {
      console.error("Failed to save product template", error);
      setFormError(error instanceof Error ? error.message : "Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== "edit" || !template) {
      return;
    }

    if (isSubmitting || isDeleting) {
      return;
    }

    const confirmed = window.confirm(`Delete ${template.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setFormError(null);

    try {
      await deleteProductTemplate(template.id);
      onDeleteSuccess?.(template.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete product template", error);
      setFormError(error instanceof Error ? error.message : "Failed to delete template.");
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogTitle = mode === "create" ? "Add Product / Service" : "Edit Product / Service";

  return (
    <Modal open={open} onClose={onClose} ariaLabel={dialogTitle} size="2xl" align="top">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <ModalHeader title={dialogTitle} onClose={onClose}>
          {author && mode === "edit" ? (
            <p className="text-[11px] text-slate-500">
              Created by {author.display_name} · Updated{" "}
              {new Date(template?.updated_at ?? template?.created_at ?? Date.now()).toLocaleString()}
            </p>
          ) : null}
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4 overflow-y-auto text-[12px]">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              type="text"
              value={values.name}
              onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Give this product or service a name..."
              required
            />
            <Select
              label="Type"
              value={values.type}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, type: event.target.value as ProductTemplateType }))
              }
            >
              {PRODUCT_TEMPLATE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </section>

          <Textarea
            label="Description"
            rows={6}
            value={values.description}
            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Add a short description that appears on proposals"
          />

          {formError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-600">
              {formError}
            </p>
          ) : null}
        </ModalBody>

        <ModalFooter className="justify-between">
          <div className="flex gap-2">
            {mode === "edit" && onDeleteSuccess ? (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isDeleting}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
