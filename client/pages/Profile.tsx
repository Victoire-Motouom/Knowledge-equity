import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useParams } from "react-router-dom";
import { Award, TrendingUp, Calendar, Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@shared/api";

export default function Profile({
  handleOverride,
}: {
  handleOverride?: string;
} = {}) {
  const VERIFIED_DOMAIN_KE = 100;
  const params = useParams();
  const handle = handleOverride ?? params.handle;
  const { accessToken, loading: authLoading } = useSupabaseAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;

    const isMe = handle === "me";
    if (isMe && authLoading) return;
    if (isMe && !accessToken) {
      setError("You must be signed in to view your profile.");
      setProfile(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const url = isMe
      ? "/api/profile/me"
      : `/api/profile/${encodeURIComponent(handle)}`;

    fetch(url, {
      headers: isMe
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    })
      .then(async (r) => {
        // Handle auth failures explicitly; they often happen when the Supabase
        // project/env vars changed and the browser still holds an old session.
        if (r.status === 401 && isMe) {
          throw new Error("unauthorized");
        }

        // For non-2xx, still try to parse JSON error payload so we can show it.
        const json = await r.json().catch(() => null);
        if (!r.ok) {
          const message =
            (json as any)?.error || `Request failed (${r.status})`;
          throw new Error(message);
        }
        return json;
      })
      .then((data: UserProfile) => {
        if (!mounted) return;
        if ((data as any)?.error) {
          setError((data as any).error);
          setProfile(null);
          return;
        }
        setProfile(data);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        if (e?.message === "unauthorized") {
          // Clear any stale session so the user can sign in again cleanly.
          supabase.auth.signOut().catch(() => {});
          setError("Your session has expired. Please sign in again.");
        } else {
          setError("Failed to load profile");
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [handle, accessToken, authLoading]);

  const primaryDomains = useMemo(() => {
    return (profile?.domain_breakdown || []).slice(0, 3).map((d) => d.domain);
  }, [profile]);

  const verifiedDomains = useMemo(() => {
    return new Set(
      (profile?.domain_breakdown || [])
        .filter((d) => d.ke >= VERIFIED_DOMAIN_KE)
        .map((d) => d.domain.toLowerCase()),
    );
  }, [profile]);

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 lg:pb-12">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading profile…</div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load profile</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && profile && (
          <>
            <section className="glass-panel rounded-3xl p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-semibold text-foreground mb-2">
                    @{profile.handle}
                  </h1>
                  <div className="flex flex-wrap gap-3">
                    {primaryDomains.map((d) => (
                      <span
                        key={d}
                        className={
                          "bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2"
                        }
                      >
                        {d}
                        {verifiedDomains.has(d.toLowerCase()) && (
                          <span className="text-[10px] uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Joined {new Date(profile.joined_at).toLocaleDateString()}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-10">
              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Award className="w-4 h-4" />
                  <span>Total KE</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {profile.ke_global.toLocaleString()}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Contributions</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {profile.contributions_count}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Globe className="w-4 h-4" />
                  <span>Domains</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {profile.domain_breakdown.length}
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined</span>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {new Date(profile.joined_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Domain Breakdown
              </h2>
              <div className="space-y-3">
                {profile.domain_breakdown.map((d) => (
                  <div
                    key={d.domain}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
                  >
                    <div className="sm:w-36 text-sm font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{d.domain}</span>
                        {verifiedDomains.has(d.domain.toLowerCase()) && (
                          <span className="text-[10px] uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                    <div className="sm:w-24 sm:text-right text-sm text-muted-foreground">
                      {d.ke} KE
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && !error && !profile && (
          <div className="text-sm text-muted-foreground">
            Profile not found.
          </div>
        )}
      </main>
    </div>
  );
}
