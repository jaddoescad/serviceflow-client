"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CompanySettingsRecord } from "@/features/companies";
import { updateCompanySettings } from "@/features/companies";
import { formatPhoneToE164 } from "@/lib/phone";
import { DEFAULT_DEAL_SOURCES } from "@/features/deals";
import type { DealSourceRecord } from "@/features/deals";
import { createDealSource, listDealSources } from "@/services/deal-sources";

type CompanySettingsFormProps = {
  company: CompanySettingsRecord;
};

type CompanySettingsFormState = {
  companyName: string;
  shortName: string;
  businessType: string;
  timeZone: string;
  licenseNumber: string;
  physicalCompanyName: string;
  physicalAddressLine1: string;
  physicalAddressLine2: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  phoneNumber: string;
  taxRate: string;
};

const toInitialState = (company: CompanySettingsRecord): CompanySettingsFormState => {
  return {
    companyName: company.name ?? "",
    shortName: company.short_name ?? company.name ?? "",
    businessType: company.business_type ?? "",
    timeZone: company.time_zone ?? "",
    licenseNumber: company.license_number ?? "",
    physicalCompanyName: company.physical_company_name ?? company.name ?? "",
    physicalAddressLine1: company.physical_address_line1 ?? "",
    physicalAddressLine2: company.physical_address_line2 ?? "",
    physicalCity: company.physical_city ?? "",
    physicalState: company.physical_state ?? "",
    physicalZip: company.physical_zip ?? "",
    phoneNumber: company.phone_number ?? "",
    taxRate:
      company.tax_rate !== null && company.tax_rate !== undefined
        ? company.tax_rate.toFixed(3)
        : "",
  };
};

export function CompanySettingsForm({ company }: CompanySettingsFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<CompanySettingsFormState>(() => toInitialState(company));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dealSources, setDealSources] = useState<DealSourceRecord[]>([]);
  const [newDealSource, setNewDealSource] = useState("");
  const [isSavingDealSource, setIsSavingDealSource] = useState(false);
  const [dealSourceError, setDealSourceError] = useState<string | null>(null);
  const [isLoadingDealSources, setIsLoadingDealSources] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingDealSources(true);

    listDealSources(company.id)
      .then((sources) => {
        if (!isMounted) return;
        const normalized = sources.length
          ? sources
          : (DEFAULT_DEAL_SOURCES as string[]).map((name, index) => ({
            id: `default-${index}`,
            company_id: company.id,
            name,
            is_default: true,
            created_by_user_id: null,
          }));
        setDealSources(normalized);
      })
      .catch((err) => {
        console.error("Failed to load deal sources", err);
        if (isMounted) {
          const fallback = (DEFAULT_DEAL_SOURCES as string[]).map((name, index) => ({
            id: `default-${index}`,
            company_id: company.id,
            name,
            is_default: true,
            created_by_user_id: null,
          }));
          setDealSources(fallback);
          setDealSourceError("Could not load deal sources. Showing defaults.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDealSources(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [company.id]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleNewDealSourceChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setNewDealSource(event.target.value);
  };

  const resetForm = () => {
    setForm(toInitialState(company));
    setError(null);
    setSuccess(null);
  };

  const handleAddDealSource = async () => {
    const trimmed = newDealSource.trim();

    if (!trimmed) {
      setDealSourceError("Enter a deal source name.");
      return;
    }

    setIsSavingDealSource(true);
    setDealSourceError(null);
    setSuccess(null);

    try {
      const created = await createDealSource(company.id, trimmed);

      setDealSources((current) => {
        const exists = current.some(
          (source) => source.name.toLowerCase() === created.name.toLowerCase()
        );

        if (exists) return current;
        return [...current, created].sort((a, b) => a.name.localeCompare(b.name));
      });

      setNewDealSource("");
      setSuccess("Deal source saved.");
    } catch (createError) {
      setDealSourceError(
        createError instanceof Error
          ? createError.message
          : "Could not save deal source."
      );
    } finally {
      setIsSavingDealSource(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const trimmedPhone = form.phoneNumber.trim();
    let formattedPhone: string | null = null;

    if (trimmedPhone) {
      formattedPhone = formatPhoneToE164(trimmedPhone);

      if (!formattedPhone) {
        setError("Enter a valid phone number in international format, such as +13433218872.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      name: form.companyName.trim() || company.name,
      short_name: form.shortName.trim() || null,
      business_type: form.businessType.trim() || null,
      time_zone: form.timeZone.trim() || null,
      license_number: form.licenseNumber.trim() || null,
      physical_company_name: form.physicalCompanyName.trim() || null,
      physical_address_line1: form.physicalAddressLine1.trim() || null,
      physical_address_line2: form.physicalAddressLine2.trim() || null,
      physical_city: form.physicalCity.trim() || null,
      physical_state: form.physicalState.trim() || null,
      physical_zip: form.physicalZip.trim() || null,
      phone_number: formattedPhone,
      tax_rate: form.taxRate.trim() !== "" ? Number(form.taxRate) : null,
    };

    try {
      const updated = await updateCompanySettings(company.id, payload);
      setForm(toInitialState(updated));
      setSuccess("Company settings saved.");
      setIsSubmitting(false);
      window.location.reload();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update company settings."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <section className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="companyName">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={handleInputChange}
              placeholder="ServiceFlow"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="shortName">
              Short Name
            </label>
            <input
              id="shortName"
              name="shortName"
              value={form.shortName}
              onChange={handleInputChange}
              placeholder="ServiceFlow"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="businessType">
              Business Type
            </label>
            <input
              id="businessType"
              name="businessType"
              value={form.businessType}
              onChange={handleInputChange}
              placeholder="Painting"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="timeZone">
              Time Zone
            </label>
            <input
              id="timeZone"
              name="timeZone"
              value={form.timeZone}
              onChange={handleInputChange}
              placeholder="America/Toronto"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="licenseNumber">
              License Number
            </label>
            <input
              id="licenseNumber"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleInputChange}
              placeholder="813184"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1.5">
          <h2 className="text-[12px] font-semibold text-slate-900">Deal Sources</h2>
          <p className="text-[11px] text-slate-500">
            Customize the deal source options your team sees when creating or scheduling deals.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            name="newDealSource"
            value={newDealSource}
            onChange={handleNewDealSourceChange}
            placeholder="e.g. Referral, Google Ads, Home Show"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSavingDealSource}
          />
          <button
            type="button"
            onClick={handleAddDealSource}
            disabled={isSavingDealSource || !newDealSource.trim()}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSavingDealSource ? "Saving..." : "Add source"}
          </button>
        </div>
        {dealSourceError ? (
          <p className="text-[11px] font-medium text-red-600">{dealSourceError}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700">
          {isLoadingDealSources ? (
            <span>Loading deal sources…</span>
          ) : dealSources.length ? (
            dealSources.map((source) => (
              <span
                key={source.id}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold"
              >
                {source.name}
              </span>
            ))
          ) : (
            <span>No deal sources yet. Add one to get started.</span>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[12px] font-semibold text-slate-900">Mailing Address</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="physicalCompanyName">
              Company Name (Physical)
            </label>
            <input
              id="physicalCompanyName"
              name="physicalCompanyName"
              value={form.physicalCompanyName}
              onChange={handleInputChange}
              placeholder="ServiceFlow"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="phoneNumber">
              Company Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleInputChange}
              placeholder="+13433218872"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="physicalAddressLine1">
              Address Line 1
            </label>
            <input
              id="physicalAddressLine1"
              name="physicalAddressLine1"
              value={form.physicalAddressLine1}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="physicalAddressLine2">
              Address Line 2
            </label>
            <input
              id="physicalAddressLine2"
              name="physicalAddressLine2"
              value={form.physicalAddressLine2}
              onChange={handleInputChange}
              placeholder="Suite 200"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="physicalCity">
              City
            </label>
            <input
              id="physicalCity"
              name="physicalCity"
              value={form.physicalCity}
              onChange={handleInputChange}
              placeholder="Ottawa"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="physicalState">
              State / Province
            </label>
            <input
              id="physicalState"
              name="physicalState"
              value={form.physicalState}
              onChange={handleInputChange}
              placeholder="ON"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="physicalZip">
            Postal Code
          </label>
          <input
            id="physicalZip"
            name="physicalZip"
            value={form.physicalZip}
            onChange={handleInputChange}
            placeholder="K1G 3H1"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1.5 max-w-xs">
          <label className="text-[11px] font-medium text-slate-700" htmlFor="taxRate">
            Tax Rate (%)
          </label>
          <input
            id="taxRate"
            name="taxRate"
            type="number"
            step="0.001"
            min="0"
            value={form.taxRate}
            onChange={handleInputChange}
            placeholder="13.000"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
            disabled={isSubmitting}
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-600">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
