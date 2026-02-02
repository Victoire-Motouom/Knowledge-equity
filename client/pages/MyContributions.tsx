import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type FeedContribution = {
  id: number;
  title: string;
  author: string;
  author_id?: string;
  domain: string;
  type: string;
  excerpt: string;
  reviews: number;
  keGained: number;
  createdAt: string;
};

export default function MyContributions() {
  const { user, accessToken, loading: authLoading } = useSupabaseAuth();
  const [filter, setFilter] = useState<"all" | "published">("all");

  const [contributions, setContributions] = useState<FeedContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We don’t yet have a proper user profile table; the server currently returns
  // author as a handle from the `users` table. For now, we match by email if present
  // else we just show an auth-required message.
  const canQuery = Boolean(user && accessToken);

  useEffect(() => {
    if (!canQuery) {
      setContributions([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const url = new URL("/api/users/me/contributions", window.location.origin);
    if (filter !== "all") url.searchParams.set("status", filter);

    fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setContributions((data.contributions as FeedContribution[]) || []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load contributions");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [accessToken, canQuery, filter]);

  const mine = useMemo(() => {
    // contributions.author_id is now exposed by the API; filter by Supabase auth uid.
    const uid = user?.id;
    if (!uid) return [];
    return contributions.filter((c) => c.author_id === uid);
  }, [contributions, user]);

  const display = useMemo(() => {
    if (filter === "published") return mine;
    return mine;
  }, [filter, mine]);

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 lg:pb-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-8 mb-8">
          <h1 className="text-4xl font-semibold text-foreground mb-2">
            My Contributions
          </h1>
          <p className="text-muted-foreground">
            Track your published research and knowledge drops.
          </p>
        </section>

        {authLoading && (
          <div className="text-sm text-muted-foreground">Checking session…</div>
        )}

        {!authLoading && !user && (
          <div className="glass-panel rounded-2xl p-6 flex items-start gap-3">
            <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-semibold text-foreground">
                Sign in required
              </div>
              <div className="text-sm text-muted-foreground">
                Please sign in to view your contributions.
              </div>
            </div>
          </div>
        )}

        {!authLoading && user && (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("published")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === "published"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Published
              </button>
            </div>

            {loading && (
              <div className="text-sm text-muted-foreground">Loading…</div>
            )}
            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTitle>Couldn’t load contributions</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && !error && display.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No contributions yet.
              </div>
            )}

            <div className="space-y-4">
              {display.map((c) => (
                <div key={c.id} className="glass-panel rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {c.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {c.domain} •{" "}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {c.excerpt}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-xl font-bold text-primary">
                        +{c.keGained}
                      </div>
                      <div className="text-xs text-muted-foreground">KE</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
