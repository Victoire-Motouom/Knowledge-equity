import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReviewCard } from "@/components/ReviewCard";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sortReviews, type ReviewSortMode } from "@/lib/reviewSort";
import { renderMarkdown } from "@/lib/markdown";
import type { ContributionDetailResponse } from "@shared/api";

export default function ContributionDetail() {
  const { id } = useParams();

  const [data, setData] = useState<ContributionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<ReviewSortMode>("top");

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/contributions/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((payload) => {
        if (!mounted) return;
        if (payload?.error) {
          setError(payload.error);
          setData(null);
          return;
        }
        setData(payload as ContributionDetailResponse);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load contribution");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-10">
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading…</div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load contribution</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Contribution Detail
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-2">
                    {data.title}
                  </h1>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{data.author}</span> •{" "}
                    <span className="bg-muted/60 text-foreground px-2 py-0.5 rounded-md border border-border">
                      {data.domain}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl font-bold text-primary">
                    +{data.ke_gained}
                  </div>
                  <div className="text-xs text-muted-foreground">KE</div>
                </div>
              </div>

              {data.excerpt &&
                !data.content?.trim().startsWith(data.excerpt.trim()) && (
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground mt-4"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(data.excerpt),
                    }}
                  />
                )}

              {data.content && (
                <div
                  className="prose prose-base max-w-none text-foreground mt-6"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(data.content),
                  }}
                />
              )}

              {data.external_link && (
                <div className="mt-6">
                  <a
                    href={data.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    External link
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Reviews ({data.reviews?.length || 0})
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex rounded-lg border border-border overflow-hidden">
                    {(
                      [
                        { id: "new", label: "New" },
                        { id: "top", label: "Top" },
                        { id: "controversial", label: "Controversial" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSortMode(opt.id)}
                        className={`px-3 py-2 text-xs font-medium ${
                          sortMode === opt.id
                            ? "bg-secondary text-foreground"
                            : "bg-background text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <Link
                    to={`/review?id=${encodeURIComponent(String(data.id))}`}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                  >
                    Write a review
                  </Link>
                </div>
              </div>

              {(data.reviews || []).length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No reviews yet.
                </div>
              )}

              <div className="space-y-3">
                {sortReviews(data.reviews || [], sortMode).map((r) => (
                  <ReviewCard
                    key={r.id}
                    id={r.id}
                    reviewer={r.reviewer}
                    rating={r.rating as any}
                    confidence={r.confidence}
                    comment={r.comment}
                    ke_awarded={r.ke_awarded}
                    created_at={r.created_at}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
