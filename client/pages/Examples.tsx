import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronDown, Eye, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Contribution, ContributionDetailResponse } from "@shared/api";

type ContributionWithMeta = Contribution & {
  author?: string;
  domain?: string;
  reviews?: number;
  keGained?: number;
  createdAt?: string;
};

export default function Examples() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<
    Record<number, ContributionDetailResponse>
  >({});
  const [contributions, setContributions] = useState<ContributionWithMeta[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch("/api/contributions")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setContributions((data.contributions as ContributionWithMeta[]) || []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load contribution examples");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => contributions.slice(0, 8), [contributions]);

  const toggle = (id: number) => {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next && !details[next]) {
      fetch(`/api/contributions/${encodeURIComponent(String(next))}`)
        .then((r) => r.json())
        .then((payload) => {
          if (payload?.error) return;
          setDetails((prev) => ({
            ...prev,
            [next]: payload as ContributionDetailResponse,
          }));
        })
        .catch((e) => console.error(e));
    }
  };

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-10 mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Real Examples
          </div>
          <h1 className="text-4xl font-semibold text-foreground mt-3">
            Live contribution examples
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Pulled directly from the feed so reviewers and contributors see real
            quality signals.
          </p>
        </section>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading…</div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load examples</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && featured.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No contributions yet.
          </div>
        )}

        <div className="space-y-5">
          {featured.map((item) => {
            const detail = details[item.id];
            return (
              <div
                key={item.id}
                className="glass-panel rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {item.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.domain} • {item.author} • {item.reviews} reviews
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedId === item.id && (
                  <div className="px-6 pb-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mt-4">
                      {detail?.excerpt || item.excerpt}
                    </p>

                    {detail?.reviews && detail.reviews.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {detail.reviews.slice(0, 2).map((review) => (
                          <div
                            key={review.id}
                            className="border border-border rounded-xl p-4"
                          >
                            <div className="text-sm font-medium text-foreground">
                              @{review.reviewer}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {review.rating} • {review.confidence}% confidence
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        +{item.keGained} KE gained
                      </div>
                      <Link
                        to={`/contribution/${item.id}`}
                        className="inline-flex items-center gap-2 text-sm text-primary"
                      >
                        View detail
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
