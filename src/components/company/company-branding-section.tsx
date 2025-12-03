"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CompanyBrandingRecord } from "@/types/company";

type CompanyBrandingSectionProps = {
  companyId: string;
  company: CompanyBrandingRecord;
};

type CompanyBrandingFormState = {
  websiteUrl: string;
  reviewUrl: string;
};

const toInitialState = (company: CompanyBrandingRecord): CompanyBrandingFormState => ({
  websiteUrl: company.website ?? "",
  reviewUrl: company.review_url ?? "",
});

export function CompanyBrandingSection({ companyId, company }: CompanyBrandingSectionProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<CompanyBrandingFormState>(() => toInitialState(company));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoStorageKey, setLogoStorageKey] = useState<string | null>(company.logo_storage_key ?? null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const logoPreviewSource = logoPreviewUrl ?? existingLogoUrl;
  const isLogoRemovalPending = removeLogo && !logoPreviewUrl && Boolean(logoStorageKey);

  useEffect(() => {
    setForm(toInitialState(company));
    setLogoStorageKey(company.logo_storage_key ?? null);
  }, [company]);

  useEffect(() => {
    let cancelled = false;

    if (!logoStorageKey) {
      setExistingLogoUrl(null);
      return () => {
        cancelled = true;
      };
    }

    const loadLogo = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}/branding/logo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storageKey: logoStorageKey }),
        });

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          console.error("Failed to load company logo", response.statusText);
          setExistingLogoUrl(null);
          return;
        }

        const result = (await response.json().catch(() => null)) as
          | { signedUrl?: string | null }
          | null;

        if (cancelled) {
          return;
        }

        setExistingLogoUrl(result?.signedUrl ?? null);
      } catch (loadError) {
        if (!cancelled) {
          console.error("Failed to load company logo", loadError);
          setExistingLogoUrl(null);
        }
      }
    };

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, [logoStorageKey]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const normalizeUrlValue = (raw: string, label: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { value: null as string | null, error: null as string | null };
    }

    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      const url = new URL(candidate);
      return { value: url.toString(), error: null };
    } catch {
      return { value: null, error: `Enter a valid ${label}.` };
    }
  };

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setRemoveLogo(false);
    setLogoPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
      setLogoFile(null);
      setRemoveLogo(Boolean(logoStorageKey));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (!logoStorageKey) {
      return;
    }

    setRemoveLogo((current) => !current);
  };

  const resetForm = () => {
    setForm(toInitialState(company));
    setError(null);
    setSuccess(null);
    setLogoFile(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(null);
    setRemoveLogo(false);
    setLogoStorageKey(company.logo_storage_key ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const websiteResult = normalizeUrlValue(form.websiteUrl, "website URL");
    if (websiteResult.error) {
      setError(websiteResult.error);
      setIsSubmitting(false);
      return;
    }

    const reviewResult = normalizeUrlValue(form.reviewUrl, "review URL");
    if (reviewResult.error) {
      setError(reviewResult.error);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("companyId", companyId);
    formData.append("websiteUrl", websiteResult.value ?? "");
    formData.append("reviewUrl", reviewResult.value ?? "");
    formData.append("removeLogo", removeLogo ? "true" : "false");

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      const response = await fetch(`/api/companies/${companyId}/branding`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Could not update brand details.";

        try {
          const result = (await response.json()) as { error?: string };
          if (result?.error) {
            message = result.error;
          }
        } catch {
          // ignore JSON parse errors and fall back to default message
        }

        setError(message);
        setIsSubmitting(false);
        return;
      }

      const result = (await response.json()) as {
        branding: CompanyBrandingRecord;
        signedUrl?: string | null;
      };

      const updatedBranding = result.branding;
      const signedUrl = result.signedUrl ?? null;

      setForm(toInitialState(updatedBranding));
      setLogoStorageKey(updatedBranding.logo_storage_key ?? null);
      setExistingLogoUrl(signedUrl);
      setSuccess("Brand details saved.");
      setLogoFile(null);
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      setLogoPreviewUrl(null);
      setRemoveLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setIsSubmitting(false);
      window.location.reload();
    } catch (submitError) {
      console.error("Failed to update company branding", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update brand details."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <section className="space-y-3">
        <h2 className="text-[12px] font-semibold text-slate-900">Branding</h2>
        <p className="text-[12px] text-slate-500">
          Control the logo and links that appear on quotes, proposals, and invoices.
        </p>
      </section>

      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="websiteUrl">
              Website URL
            </label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={handleInputChange}
              placeholder="https://serviceflow.com"
              inputMode="url"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="reviewUrl">
              Review URL
            </label>
            <input
              id="reviewUrl"
              name="reviewUrl"
              value={form.reviewUrl}
              onChange={handleInputChange}
              placeholder="https://g.page/yourbusiness/review"
              inputMode="url"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-700" htmlFor="companyLogo">
            Company Logo
          </label>
          <div className="mt-1 flex flex-col gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                {logoPreviewSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreviewSource}
                    alt={`${company.name || "Company"} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-2 text-center text-[11px] text-slate-400">No logo uploaded</span>
                )}
              </div>
              <div className="flex flex-col gap-2 text-[11px] text-slate-500">
                <span>Upload a square PNG, JPG, or SVG (max 5 MB).</span>
                {isLogoRemovalPending ? (
                  <span className="font-medium text-amber-600">
                    Logo will be removed after you save changes.
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                Upload Logo
              </button>
              {(logoPreviewUrl || logoStorageKey) && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center rounded-md border border-rose-200 px-3 py-1.5 text-[12px] font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
                >
                  {logoPreviewUrl || !isLogoRemovalPending ? "Remove Logo" : "Restore Logo"}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="companyLogo"
              name="companyLogo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoFileChange}
            />
          </div>
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
