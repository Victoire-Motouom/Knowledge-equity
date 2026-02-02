import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } catch (err) {
          console.error("Supabase exchangeCodeForSession failed", err);
        }
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      const { data: sessionData } = await supabase.auth.getSession();

      if (!mounted) return;
      setUser(currentUser ?? null);
      setAccessToken(sessionData?.session?.access_token ?? null);
      setLoading(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = async (provider: string) => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      await supabase.auth.signInWithOtp({ email });
    } catch (err) {
      console.error(err);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    user,
    accessToken,
    loading,
    signInWithProvider,
    signInWithEmail,
    signOut,
  };
}
