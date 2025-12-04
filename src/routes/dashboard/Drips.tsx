import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useDripSequences } from "@/hooks";
import { SALES_DEAL_STAGE_OPTIONS, JOBS_DEAL_STAGE_OPTIONS } from "@/features/deals";
import { DripsManagementView } from "@/components/drips/drips-management-view";
import { DripsManagementSkeleton } from "@/components/ui/skeleton";

// Stages that don't support drips
const STAGES_WITHOUT_DRIPS = ["estimate_scheduled"];

export default function DripsPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();

  const { data: salesSequences = [], isLoading: salesLoading } = useDripSequences(company?.id, "sales");
  const { data: jobsSequences = [], isLoading: jobsLoading } = useDripSequences(company?.id, "jobs");

  const sequences = useMemo(() => [...salesSequences, ...jobsSequences], [salesSequences, jobsSequences]);

  // Filter out stages that don't support drips
  const filteredSalesStages = useMemo(
    () => SALES_DEAL_STAGE_OPTIONS.filter((stage) => !STAGES_WITHOUT_DRIPS.includes(stage.id)),
    []
  );

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
      salesStages={filteredSalesStages}
      jobsStages={JOBS_DEAL_STAGE_OPTIONS}
      initialSequences={sequences}
    />
  );
}
