import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function completeAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (window.location.hash.includes("access_token")) {
          const authAny = supabase.auth as any;
          if (typeof authAny.getSessionFromUrl === "function") {
            await authAny.getSessionFromUrl({ storeSession: true });
          }
        }
      } catch (err) {
        console.error("Auth callback failed", err);
      } finally {
        if (mounted) {
          navigate("/feed", { replace: true });
        }
      }
    }

    completeAuth();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background page-surface flex items-center justify-center text-sm text-muted-foreground">
      Completing sign-in…
    </div>
  );
}
