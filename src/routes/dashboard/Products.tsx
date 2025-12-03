import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks";
import { ProductsPageClient } from "@/components/products/products-page-client";
import { ProductsPageSkeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company, member } = useCompanyContext();
  const { companyMembers } = useMembersContext();
  const { data: templates = [], isLoading: productsLoading } = useProducts(company?.id);

  const canManage = !member || member.role === "admin";

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  if (authLoading || productsLoading || !company) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-slate-50">
      <ProductsPageClient
        companyId={company.id}
        canManage={canManage}
        initialTemplates={templates}
        companyMembers={companyMembers}
      />
    </div>
  );
}
