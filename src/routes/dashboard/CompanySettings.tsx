import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { CompanyEmailSettingsSection } from "@/components/company/company-email-settings-section";
import { CompanySettingsForm } from "@/components/company/company-settings-form";
import { CompanyBrandingSection } from "@/components/company/company-branding-section";
import { CompanyTwilioSettingsSection } from "@/components/company/company-twilio-settings-section";
import { CompanyTemplatesSection } from "@/components/company/company-templates-section";
import { CompanyPipelinesSection } from "@/components/company/company-pipelines-section";
import { useCompanySettingsDetail, useCompanyEmailSettings } from "@/hooks";
import { CompanySettingsSkeleton } from "@/components/ui/skeleton";

type NavigationSection = "company" | "brand" | "email" | "phone" | "templates" | "pipelines";

type NavigationItem =
  | { label: string; section: NavigationSection; enabled: true }
  | { label: string; enabled: false };

const navigationItems: NavigationItem[] = [
  { label: "Company Information", section: "company", enabled: true },
  { label: "Brand", section: "brand", enabled: true },
  { label: "Email Settings", section: "email", enabled: true },
  { label: "Templates", section: "templates", enabled: true },
  { label: "Pipelines", section: "pipelines", enabled: true },
  { label: "Phone Settings", section: "phone", enabled: true },
  { label: "App Settings", enabled: false },
  { label: "Calendar", enabled: false },
  { label: "Notifications", enabled: false },
];

export default function CompanySettingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: authLoading } = useSessionContext();
  const { company: authCompany } = useCompanyContext();

  const { data: company, isLoading: companyLoading } = useCompanySettingsDetail(authCompany?.id);
  const { data: emailSettings, isLoading: emailLoading } = useCompanyEmailSettings(authCompany?.id);

  const requestedSection = searchParams.get('section')?.toLowerCase() ?? "company";
  const activeSection: NavigationSection =
    requestedSection === "brand"
      ? "brand"
      : requestedSection === "email"
        ? "email"
        : requestedSection === "templates"
          ? "templates"
          : requestedSection === "pipelines"
            ? "pipelines"
            : requestedSection === "phone"
              ? "phone"
              : "company";

  useEffect(() => {
    if (authLoading) return;
    if (!authCompany) {
      navigate("/organizations/select");
    }
  }, [authLoading, authCompany, navigate]);

  useEffect(() => {
    if (!companyLoading && !company && authCompany) {
      navigate("/organizations/select");
    }
  }, [companyLoading, company, authCompany, navigate]);

  if (authLoading || companyLoading || emailLoading || !company || !authCompany) {
    return <CompanySettingsSkeleton />;
  }

  let content: ReactNode;

  if (activeSection === "email") {
    content = (
      <CompanyEmailSettingsSection
        companyId={authCompany.id}
        initialSettings={emailSettings}
      />
    );
  } else if (activeSection === "brand") {
    content = (
      <CompanyBrandingSection
        companyId={authCompany.id}
        company={{
          id: company.id,
          name: company.name ?? "",
          website: company.website ?? null,
          review_url: company.review_url ?? null,
          logo_storage_key: company.logo_storage_key ?? null,
        }}
      />
    );
  } else if (activeSection === "templates") {
    content = <CompanyTemplatesSection company={company} />;
  } else if (activeSection === "pipelines") {
    content = <CompanyPipelinesSection companyId={authCompany.id} />;
  } else if (activeSection === "phone") {
    content = (
      <CompanyTwilioSettingsSection
        companyId={authCompany.id}
        initialSettings={company}
      />
    );
  } else {
    content = <CompanySettingsForm company={company} />;
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <nav className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-3 text-xs font-semibold text-slate-700">
          {navigationItems.map((item) => {
            if (!item.enabled) {
              return (
                <span
                  key={item.label}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-400"
                >
                  {item.label}
                </span>
              );
            }

            const isActive = item.section === activeSection;
            const href = `/company/settings?section=${item.section}`;

            return (
              <Link
                key={item.label}
                to={href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${isActive
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-slate-500 hover:bg-slate-100"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1 overflow-y-auto pr-1.5">{content}</div>
      </div>
    </div>
  );
}
