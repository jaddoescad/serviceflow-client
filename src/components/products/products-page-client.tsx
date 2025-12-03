"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { PRODUCT_TEMPLATE_TYPE_OPTIONS } from "@/features/products";
import type { CompanyMemberRecord } from "@/features/companies";
import type {
  ProductTemplateRecord,
  ProductTemplateType,
} from "@/features/products";
import { ProductTemplateModal, type ProductTemplateModalMode } from "@/components/dialog-forms/product-template-modal";

type FilterState = {
  search: string;
  type: ProductTemplateType | "all";
};

type AlertState = {
  type: "success" | "error";
  message: string;
};

type ProductsPageClientProps = {
  companyId: string;
  canManage: boolean;
  initialTemplates: ProductTemplateRecord[];
  companyMembers: CompanyMemberRecord[];
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  type: "all",
};

function sortTemplates(items: ProductTemplateRecord[]): ProductTemplateRecord[] {
  return items
    .slice()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

function matchesFilters(template: ProductTemplateRecord, filters: FilterState): boolean {
  const search = filters.search.trim().toLowerCase();

  if (search) {
    const haystacks = [template.name, template.description ?? ""].map((value) => value.toLowerCase());
    const searchMatch = haystacks.some((value) => value.includes(search));

    if (!searchMatch) {
      return false;
    }
  }

  if (filters.type !== "all" && template.type !== filters.type) {
    return false;
  }

  return true;
}

function renderTypeBadge(value: ProductTemplateType) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {value === "service" ? "Service" : "Product"}
    </span>
  );
}

export function ProductsPageClient({
  companyId,
  canManage,
  initialTemplates,
  companyMembers,
}: ProductsPageClientProps) {
  const [templates, setTemplates] = useState<ProductTemplateRecord[]>(() => sortTemplates(initialTemplates));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    initialTemplates[0]?.id ?? null
  );
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [modalMode, setModalMode] = useState<ProductTemplateModalMode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const membersByUserId = useMemo(() => {
    const map = new Map<string, CompanyMemberRecord>();
    companyMembers.forEach((member) => {
      map.set(member.user_id, member);
    });
    return map;
  }, [companyMembers]);

  const filteredTemplates = useMemo(() => {
    if (templates.length === 0) {
      return [];
    }

    return templates.filter((template) => matchesFilters(template, filters));
  }, [templates, filters]);

  useEffect(() => {
    if (!alert) {
      return;
    }

    const timer = window.setTimeout(() => setAlert(null), 3000);
    return () => window.clearTimeout(timer);
  }, [alert]);

  const selectedTemplate = selectedTemplateId
    ? templates.find((template) => template.id === selectedTemplateId) ?? null
    : null;
  const selectedAuthor = selectedTemplate
    ? membersByUserId.get(selectedTemplate.created_by_user_id) ?? null
    : null;

  const showModal = modalOpen && modalMode !== null;

  const openCreateModal = () => {
    if (!canManage) {
      return;
    }
    setModalMode("create");
    setModalOpen(true);
  };

  const openEditModal = (templateId: string) => {
    if (!canManage) {
      return;
    }
    setSelectedTemplateId(templateId);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleTemplateCreated = (template: ProductTemplateRecord) => {
    setTemplates((prev) => sortTemplates([...prev, template]));
    setSelectedTemplateId(template.id);
    setAlert({ type: "success", message: "Template created." });
  };

  const handleTemplateUpdated = (template: ProductTemplateRecord) => {
    setTemplates((prev) => {
      const next = prev.map((item) => (item.id === template.id ? template : item));
      return sortTemplates(next);
    });
    setSelectedTemplateId(template.id);
    setAlert({ type: "success", message: "Template updated." });
  };

  const handleTemplateDeleted = (templateId: string) => {
    setTemplates((prev) => prev.filter((item) => item.id !== templateId));

    if (selectedTemplateId === templateId) {
      const remaining = templates.filter((item) => item.id !== templateId);
      setSelectedTemplateId(remaining[0]?.id ?? null);
    }

    setAlert({ type: "success", message: "Template deleted." });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, type: event.target.value as ProductTemplateType | "all" }));
  };

  const templatesToShow = filteredTemplates;
  const emptyStateMessage =
    templates.length === 0 ? "No products or services yet." : "No results match the current filters.";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-slate-200 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Products & Services</h1>
            <p className="text-[11px] text-slate-500">
              Click a template to update it or add a new one to reuse later.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[12px] sm:flex-row sm:items-center">
            <input
              type="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search products or services..."
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
            />
            <div className="flex gap-2">
              <select
                value={filters.type}
                onChange={handleTypeChange}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All types</option>
                {PRODUCT_TEMPLATE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              disabled={!canManage}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add New
            </button>
          </div>
        </div>
        {alert ? (
          <div
            className={`mt-3 w-full rounded-lg px-3 py-2 text-[12px] ${
              alert.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {alert.message}
          </div>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span className="col-span-2">Name</span>
            <span className="text-center">Type</span>
          </div>
          <div className="max-h-full overflow-y-auto">
            {templatesToShow.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-slate-500">{emptyStateMessage}</div>
            ) : (
              <ul className="divide-y divide-slate-200 text-[12px]">
                {templatesToShow.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <li key={template.id}>
                      <button
                        type="button"
                        onClick={() => openEditModal(template.id)}
                        className={`grid w-full grid-cols-3 items-center px-3 py-2 text-left transition ${
                          isSelected
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-slate-100 focus:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="col-span-2 truncate font-medium">{template.name}</span>
                        <span className="flex justify-center">{renderTypeBadge(template.type)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ProductTemplateModal
        companyId={companyId}
        mode={modalMode ?? "create"}
        open={showModal}
        template={modalMode === "edit" ? selectedTemplate : null}
        author={modalMode === "edit" ? selectedAuthor : null}
        onClose={closeModal}
        onSubmitSuccess={(record) => {
          if (modalMode === "create") {
            handleTemplateCreated(record);
          } else {
            handleTemplateUpdated(record);
          }
        }}
        onDeleteSuccess={(templateId) => {
          handleTemplateDeleted(templateId);
        }}
      />
    </div>
  );
}
