import { useNavigate } from "react-router-dom";
import { useSessionContext, useCompanyContext, useMembersContext } from "@/contexts/AuthContext";
import { CompanyMembersManager } from "@/components/company/company-members-manager";
import { UsersPageSkeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const { companyMembers } = useMembersContext();

  if (authLoading || !company || !user) {
    return <UsersPageSkeleton />;
  }

  return (
    <div className="flex w-full flex-1 min-h-0 flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Users</h1>
          <p className="text-[11px] text-slate-500">Invite teammates and manage their access.</p>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <CompanyMembersManager initialMembers={companyMembers} currentUserId={user.id} />
      </div>
    </div>
  );
}
