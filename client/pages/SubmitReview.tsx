import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InsetGroup,
  InsetRow,
  InsetDivider,
} from "@/components/ui/inset-group";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ArrowLeft, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { handleMarkdownPaste } from "@/lib/pasteMarkdown";
import { Link, useSearchParams } from "react-router-dom";
import type { ContributionDetailResponse } from "@shared/api";

export default function SubmitReview() {
  const { accessToken, loading: authLoading } = useSupabaseAuth();
  const [searchParams] = useSearchParams();
  const contributionId = searchParams.get("id");

  const [rating, setRating] = useState<
    import("@shared/api").ReviewRating | null
  >(null);
  const [confidence, setConfidence] = useState(80);
  const [comment, setComment] = useState("");

  const [contribution, setContribution] =
    useState<ContributionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!contributionId) {
      setLoading(false);
      setError(
        "Missing contribution id. Open this page as /review?id=<contribution_id>",
      );
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/contributions/${encodeURIComponent(contributionId)}`)
      .then((r) => r.json())
      .then((payload) => {
        if (!mounted) return;
        if (payload?.error) {
          setError(payload.error);
          setContribution(null);
          return;
        }
        setContribution(payload as ContributionDetailResponse);
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
  }, [contributionId]);

  const ratingOptions = useMemo(
    () => [
      {
        value: "confirmed_correct" as const,
        title: "Confirmed correct",
        description:
          "The claims are accurate and backed by evidence or clear reasoning.",
        icon: CheckCircle2,
        color: "text-green-600",
      },
      {
        value: "novel_insight" as const,
        title: "Novel insight",
        description:
          "Contains a genuinely new or non-obvious insight that adds value.",
        icon: Lightbulb,
        color: "text-blue-600",
      },
      {
        value: "valuable_incomplete" as const,
        title: "Valuable but incomplete",
        description:
          "Useful contribution but missing key details, steps, or evidence.",
        icon: AlertCircle,
        color: "text-yellow-600",
      },
      {
        value: "incorrect_constructive" as const,
        title: "Incorrect but constructive",
        description:
          "Has errors, but provides value through framing, partial results, or discussion.",
        icon: AlertCircle,
        color: "text-orange-600",
      },
      {
        value: "not_credible" as const,
        title: "Not credible",
        description: "Low quality or misleading; do not treat as reliable.",
        icon: AlertCircle,
        color: "text-red-600",
      },
    ],
    [],
  );

  async function submit() {
    if (!contributionId) return;
    setSubmitState("submitting");
    setSubmitError(null);

    try {
      if (authLoading) throw new Error("Checking session, please try again.");
      if (!accessToken) throw new Error("Please sign in to submit a review.");

      const trimmed = comment.trim();
      const confidenceInt = Math.max(0, Math.min(100, Math.round(confidence)));

      if (!rating) throw new Error("Select a rating");
      if (trimmed.length < 50) {
        throw new Error("Comment must be at least 50 characters");
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contribution_id: Number(contributionId),
          rating,
          confidence: confidenceInt,
          comment: trimmed,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = data?.details
          ? `\n${JSON.stringify(data.details)}`
          : "";
        throw new Error(
          (data?.error || `Failed to submit review (${res.status})`) + details,
        );
      }
      setSubmitState("success");
    } catch (e: any) {
      setSubmitState("error");
      setSubmitError(e?.message || "Failed to submit review");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <Link
          to={contributionId ? `/contribution/${contributionId}` : "/feed"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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

        {!loading && !error && contribution && (
          <div className="space-y-6">
            <InsetGroup title="Contribution">
              <InsetRow>
                <h1 className="text-lg font-semibold text-foreground">
                  Review: {contribution.title}
                </h1>
                <div className="text-sm text-muted-foreground mt-1">
                  {contribution.author} • {contribution.domain}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {contribution.excerpt}
                </p>
              </InsetRow>
            </InsetGroup>

            <InsetGroup title="Rating">
              <InsetRow>
                <div className="space-y-3">
                  {ratingOptions.map((opt) => {
                    const Icon = opt.icon;
                    const selected = rating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setRating(opt.value)}
                        className={`w-full text-left border rounded-lg p-4 transition-colors ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${opt.color}`} />
                          <div>
                            <div className="font-semibold text-foreground">
                              {opt.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {opt.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </InsetRow>
            </InsetGroup>

            <InsetGroup title="Confidence">
              <InsetRow>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {confidence}%
                </div>
              </InsetRow>
            </InsetGroup>

            <InsetGroup title="Comment" description="Minimum 50 characters.">
              <InsetRow>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onPaste={(e) => handleMarkdownPaste(e, comment, setComment)}
                  rows={8}
                  className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Be specific. Examples:\n- What is correct/incorrect?\n- What evidence supports your view?\n- What would you change?`}
                />
              </InsetRow>
            </InsetGroup>

            <div className="px-1">
              <button
                onClick={submit}
                disabled={submitState === "submitting" || !rating}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
              >
                {submitState === "submitting" ? "Submitting…" : "Submit review"}
              </button>

              {submitState === "success" && (
                <Alert className="mt-3">
                  <AlertTitle>Submitted</AlertTitle>
                  <AlertDescription>Review submitted.</AlertDescription>
                </Alert>
              )}
              {submitState === "error" && submitError && (
                <Alert variant="destructive" className="mt-3">
                  <AlertTitle>Couldn’t submit review</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
