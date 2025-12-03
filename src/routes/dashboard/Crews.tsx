import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useCrews } from "@/hooks";
import { CrewsPageClient } from "@/components/crews/crews-page-client";
import { CrewsPageSkeleton } from "@/components/ui/skeleton";

export default function CrewsPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSessionContext();
  const { company, member } = useCompanyContext();
  const { data: crews = [], isLoading: crewsLoading } = useCrews(company?.id);

  const canManage = !member || member.role === "admin";

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || crewsLoading || !company || !user) {
    return <CrewsPageSkeleton />;
  }

  return (
    <CrewsPageClient
      companyId={company.id}
      canManage={canManage}
      initialCrews={crews}
      userId={user.id}
    />
  );
}
