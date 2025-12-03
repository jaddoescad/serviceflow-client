import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useCommunicationTemplates } from "@/hooks";
import { CommunicationTemplatesManager } from "@/components/communication-templates/communication-templates-manager";
import { CommunicationTemplatesSkeleton } from "@/components/ui/skeleton";

export default function CommunicationTemplatesPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { data: records = [], isLoading: templatesLoading } = useCommunicationTemplates(company?.id);

  const templates = useMemo(() => {
    return records.map(r => ({
      key: r.template_key,
      name: r.name,
      description: r.description,
      emailSubject: r.email_subject || '',
      emailBody: r.email_body || '',
      smsBody: r.sms_body || '',
      updatedAt: r.updated_at
    }));
  }, [records]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || templatesLoading || !company) {
    return <CommunicationTemplatesSkeleton />;
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-900">Communication Templates</h1>
        <p className="text-[11px] text-slate-500">
          Manage default messages used when sending proposals by email or text.
        </p>
      </header>

      <CommunicationTemplatesManager
        companyId={company.id}
        templates={templates}
      />
    </div>
  );
}
