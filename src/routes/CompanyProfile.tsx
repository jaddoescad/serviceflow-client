

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanySetupForm } from "@/components/company/company-setup-form";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function CompanyProfilePage() {
  const supabase = useSupabaseBrowserClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadData();
  }, [supabase, navigate]);

  if (loading) {
    return <LoadingPage />;
  }

  // Users can always create a new organization
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <CompanySetupForm userId={user.id} email={user.email ?? null} />
    </div>
  );
}
