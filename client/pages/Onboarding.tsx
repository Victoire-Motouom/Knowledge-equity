import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Award, CheckCircle2, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Onboarding() {
  const [stats, setStats] = useState({
    contributions: 0,
    domains: 0,
    leaders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/api/contributions").then((r) => r.json()),
      fetch("/api/domains?stats=0").then((r) => r.json()),
      fetch("/api/leaderboard").then((r) => r.json()),
    ])
      .then(([contrib, domains, leaders]) => {
        if (!mounted) return;
        setStats({
          contributions: contrib?.contributions?.length || 0,
          domains: domains?.domains?.length || 0,
          leaders: leaders?.leaders?.length || 0,
        });
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load onboarding data");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-8 mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Getting Started
          </div>
          <h1 className="text-4xl font-semibold text-foreground mt-3">
            Knowledge Equity onboarding
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            A real-time view of the community and the steps to earn reputation.
          </p>
        </section>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading…</div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load onboarding</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="glass-panel rounded-2xl p-4">
              <div className="text-xs text-muted-foreground">
                Live contributions
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {stats.contributions}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <div className="text-xs text-muted-foreground">
                Active domains
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {stats.domains}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <div className="text-xs text-muted-foreground">Top reviewers</div>
              <div className="text-2xl font-semibold text-foreground">
                {stats.leaders}
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            How knowledge earns reputation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="w-4 h-4 text-primary" />
                1. Publish a contribution
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Share a real explanation, research note, or debate. The feed is
                your public record.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Award className="w-4 h-4 text-primary" />
                2. Get expert reviews
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Reviews validate accuracy and add KE based on reviewer
                reputation and confidence.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                3. Grow domain KE
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your profile reflects the domains you’ve earned credibility in,
                not just activity.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">
                Next action
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Start with one contribution and let the review system do the
                rest.
              </p>
              <div className="mt-3 flex gap-3">
                <a
                  href="/contribute"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold text-center"
                >
                  Contribute
                </a>
                <a
                  href="/feed"
                  className="flex-1 border border-border px-4 py-2 rounded-lg text-sm font-semibold text-center"
                >
                  View feed
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
