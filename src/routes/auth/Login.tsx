import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
import { useSupabaseBrowserClient } from "@/hooks/useSupabaseBrowserClient";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function LoginPage() {
  const navigate = useNavigate();
  const supabase = useSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        navigate("/");
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [supabase, navigate]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      <AuthForm />
    </div>
  );
}
