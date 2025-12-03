import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useDripSequences } from "@/hooks";
import { SALES_DEAL_STAGE_OPTIONS, JOBS_DEAL_STAGE_OPTIONS } from "@/features/deals";
import { DripsManagementView } from "@/components/drips/drips-management-view";
import { DripsManagementSkeleton } from "@/components/ui/skeleton";

export default function DripsPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();

  const { data: salesSequences = [], isLoading: salesLoading } = useDripSequences(company?.id, "sales");
  const { data: jobsSequences = [], isLoading: jobsLoading } = useDripSequences(company?.id, "jobs");

  const sequences = useMemo(() => [...salesSequences, ...jobsSequences], [salesSequences, jobsSequences]);

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || salesLoading || jobsLoading || !company) {
    return <DripsManagementSkeleton />;
  }

  return (
    <DripsManagementView
      companyId={company.id}
      salesStages={SALES_DEAL_STAGE_OPTIONS}
      jobsStages={JOBS_DEAL_STAGE_OPTIONS}
      initialSequences={sequences}
    />
  );
}
