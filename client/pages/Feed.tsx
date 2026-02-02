import Header from "@/components/Header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  TrendingUp,
  Award,
  Zap,
  MessageSquare,
  X,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CONTRIBUTION_TYPES,
  type ContributionType,
  type SolveIssue,
} from "@shared/api";
import EmojiAvatar from "@/components/EmojiAvatar";
import { renderMarkdown } from "@/lib/markdown";
import { useAuth } from "@/auth/AuthContext";

type FeedContribution = {
  id: number | string;
  title: string;
  excerpt: string;
  domain: string;
  type: ContributionType;
  author: string;
  author_id?: string;
  reviews: number;
  keGained: number;
  createdAt: string;
};

export default function Feed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();
  const [feedMode, setFeedMode] = useState<"discover" | "solve">("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [domainQuery, setDomainQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContributionType | null>(
    null,
  );

  const [issueTitle, setIssueTitle] = useState("");
  const [issueSummary, setIssueSummary] = useState("");
  const [issueImpact, setIssueImpact] = useState(5);
  const [issueDomain, setIssueDomain] = useState("");
  const [issueAction, setIssueAction] =
    useState<SolveIssue["actionNeeded"]>("awareness");
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  const [contributions, setContributions] = useState<FeedContribution[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [solveIssues, setSolveIssues] = useState<SolveIssue[]>([]);

  const cacheKey = "ke_feed_cache";
  const seenKey = "ke_feed_seen";

  const getSeenIds = () => {
    try {
      return new Set<string>(JSON.parse(localStorage.getItem(seenKey) || "[]"));
    } catch {
      return new Set<string>();
    }
  };

  const saveSeenIds = (ids: Set<string>) => {
    localStorage.setItem(seenKey, JSON.stringify(Array.from(ids).slice(-500)));
  };

  const cacheUnseen = (items: FeedContribution[]) => {
    const seen = getSeenIds();
    const cached = items.filter((item) => !seen.has(String(item.id)));
    localStorage.setItem(cacheKey, JSON.stringify(cached.slice(0, 100)));
  };

  const loadCached = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "[]");
      if (Array.isArray(cached)) return cached as FeedContribution[];
    } catch {
      // ignore
    }
    return [] as FeedContribution[];
  };

  const markSeen = (id: string | number) => {
    const seen = getSeenIds();
    seen.add(String(id));
    saveSeenIds(seen);
  };

  useEffect(() => {
    let mounted = true;

    fetch("/api/contributions")
      .then((r) => r.json())
      .then((data: { contributions?: FeedContribution[] }) => {
        if (!mounted) return;
        const ordered = (data.contributions || [])
          .map((c) => {
            const ke = Number(c.keGained ?? 0);
            const jitter = Math.max(5, ke * 0.35);
            return { ...c, _score: ke + Math.random() * jitter };
          })
          .sort((a, b) => b._score - a._score)
          .map(({ _score, ...rest }) => rest);
        setContributions(ordered);
        cacheUnseen(ordered);
      })
      .catch((err) => {
        console.error(err);
        const cached = loadCached();
        if (cached.length > 0) {
          setContributions(cached);
        }
      });

    // Fetch domains for filter suggestions
    fetch("/api/domains?stats=0")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const names = (data.domains || [])
          .map((d: any) => d?.name)
          .filter(Boolean);
        setDomains(names);
      })
      .catch((err) => console.error(err));

    fetch("/api/solve-issues")
      .then((r) => r.json())
      .then((data: { issues?: SolveIssue[] }) => {
        if (!mounted) return;
        setSolveIssues(data.issues || []);
      })
      .catch((err) => console.error(err));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    if (mode === "solve" || mode === "discover") {
      setFeedMode(mode);
    }
  }, [location.search]);

  const filteredContributions = contributions.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain =
      selectedDomain === null || c.domain === selectedDomain;
    const matchesType = selectedType === null || c.type === selectedType;

    return matchesSearch && matchesDomain && matchesType;
  });

  const filteredIssues = solveIssues.filter((issue) => {
    const matchesSearch =
      searchTerm === "" ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain =
      selectedDomain === null || issue.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-24 lg:pb-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-10 mb-10">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/70 px-4 py-2">
            <SegmentedControl
              className="min-w-max"
              value={feedMode}
              onChange={(v) => setFeedMode(v as "discover" | "solve")}
              options={[
                { value: "discover", label: "Discover" },
                { value: "solve", label: "Solve" },
              ]}
            />
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            {feedMode === "discover" && (
              <SegmentedControl
                className="min-w-max"
                value={(selectedType ?? "all") as any}
                onChange={(v) =>
                  setSelectedType(v === "all" ? null : (v as any))
                }
                options={[
                  { value: "all", label: "All" },
                  ...CONTRIBUTION_TYPES.map((t) => ({
                    value: t as any,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  })),
                ]}
              />
            )}
          </div>

          {(selectedDomain || selectedType) && (
            <div className="flex flex-wrap gap-2 items-center pt-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {selectedDomain && (
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>{selectedDomain}</span>
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="hover:text-primary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedType && (
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>{selectedType}</span>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="hover:text-primary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedDomain(null);
                  setSelectedType(null);
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="glass-panel rounded-2xl p-5 h-fit">
            <div className="text-sm font-semibold text-foreground mb-3">
              Filter by Domain
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setSelectedDomain(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedDomain === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={domainQuery}
                onChange={(e) => setDomainQuery(e.target.value)}
                placeholder="Search domains"
                inputMode="search"
                className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {domainQuery.trim().length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {domains
                  .filter((d) =>
                    d.toLowerCase().includes(domainQuery.trim().toLowerCase()),
                  )
                  .slice(0, 12)
                  .map((d) => {
                    const selected = selectedDomain === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSelectedDomain(d);
                          setDomainQuery("");
                        }}
                        className={
                          selected
                            ? "px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm"
                            : "px-3 py-1.5 rounded-full bg-muted/60 text-foreground text-sm border border-border hover:bg-muted"
                        }
                      >
                        {d}
                      </button>
                    );
                  })}
              </div>
            )}
          </aside>

          <div className="space-y-5">
            {feedMode === "discover" &&
              filteredContributions.map((contribution) => {
                const type = (contribution.type || "research") as string;
                const Icon =
                  type === "explanation"
                    ? Award
                    : type === "bug"
                      ? TrendingUp
                      : type === "debate"
                        ? Zap
                        : Award;

                return (
                  <div
                    key={contribution.id}
                    className="glass-panel rounded-2xl p-6 hover:shadow-lg ios-transition ios-press cursor-pointer group"
                    onClick={() => {
                      markSeen(contribution.id);
                      navigate(`/contribution/${contribution.id}`);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="p-3 bg-primary/10 rounded-2xl h-fit border border-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3">
                          <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-1 leading-snug">
                              {contribution.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-2 font-medium">
                                <EmojiAvatar
                                  handle={contribution.author}
                                  size="sm"
                                />
                                {contribution.author}
                              </span>
                              <span>•</span>
                              <span className="bg-muted/60 text-foreground px-2 py-0.5 rounded-md border border-border">
                                {contribution.domain}
                              </span>
                              <span>•</span>
                              <span>{contribution.createdAt}</span>
                            </div>
                          </div>
                          <div className="sm:text-right flex-shrink-0">
                            <div className="text-2xl font-bold text-primary">
                              +{contribution.keGained}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              KE
                            </div>
                          </div>
                        </div>

                        <div
                          className="prose prose-sm max-w-none text-muted-foreground mb-4 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(contribution.excerpt),
                          }}
                        />

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>{contribution.reviews} reviews</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm text-primary">
                            View
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {feedMode === "solve" && (
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Create Solve Issue
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Post a concrete problem that needs action.
                    </p>
                  </div>
                </div>
                {issueError && (
                  <div className="mt-3 text-sm text-destructive">
                    {issueError}
                  </div>
                )}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="Issue title"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    value={issueDomain}
                    onChange={(e) => setIssueDomain(e.target.value)}
                    placeholder="Domain"
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <textarea
                  value={issueSummary}
                  onChange={(e) => setIssueSummary(e.target.value)}
                  placeholder="Describe the issue, impact, and current context"
                  className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px]"
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Impact (1–10)
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={issueImpact}
                      onChange={(e) => setIssueImpact(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {issueImpact}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Action needed
                    </div>
                    <select
                      value={issueAction}
                      onChange={(e) =>
                        setIssueAction(
                          e.target.value as SolveIssue["actionNeeded"],
                        )
                      }
                      className="w-full px-3 py-2 border border-border rounded-xl bg-background"
                    >
                      <option value="awareness">Awareness</option>
                      <option value="funding">Funding</option>
                      <option value="code">Code</option>
                      <option value="policy">Policy</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={issueSubmitting}
                    onClick={async () => {
                      setIssueError(null);
                      if (!accessToken) {
                        setIssueError("Please sign in to create an issue.");
                        return;
                      }
                      if (
                        !issueTitle.trim() ||
                        !issueSummary.trim() ||
                        !issueDomain.trim()
                      ) {
                        setIssueError(
                          "Title, domain, and summary are required.",
                        );
                        return;
                      }
                      try {
                        setIssueSubmitting(true);
                        const resp = await fetch("/api/solve-issues", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                          },
                          body: JSON.stringify({
                            title: issueTitle.trim(),
                            summary: issueSummary.trim(),
                            domain: issueDomain.trim(),
                            impact: issueImpact,
                            actionNeeded: issueAction,
                          }),
                        });
                        const data = await resp.json().catch(() => ({}));
                        if (!resp.ok) {
                          throw new Error(
                            data?.error || "Failed to create issue",
                          );
                        }
                        const newIssue = data?.issue;
                        if (newIssue) {
                          setSolveIssues((prev) => [newIssue, ...prev]);
                          setIssueTitle("");
                          setIssueSummary("");
                          setIssueDomain("");
                          setIssueImpact(5);
                          setIssueAction("awareness");
                        }
                      } catch (err: any) {
                        setIssueError(err?.message || "Failed to create issue");
                      } finally {
                        setIssueSubmitting(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-60"
                  >
                    {issueSubmitting ? "Submitting…" : "Create issue"}
                  </button>
                </div>
              </div>
            )}

            {feedMode === "solve" &&
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="glass-panel rounded-2xl p-6 hover:shadow-lg ios-transition ios-press cursor-pointer"
                  onClick={() => navigate(`/solve/${issue.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Solve Issue
                      </div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-2">
                        {issue.title}
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        {issue.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-border bg-background/60 px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                          Impact
                        </div>
                        <div className="text-2xl font-semibold text-foreground">
                          {issue.impact}/10
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="bg-muted/60 text-foreground px-2 py-1 rounded-full border border-border">
                      {issue.domain}
                    </span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {issue.status.replace("_", " ")}
                    </span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      Action: {issue.actionNeeded}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {feedMode === "discover" && filteredContributions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No contributions match your filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDomain(null);
                setSelectedType(null);
              }}
              className="text-primary font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {feedMode === "discover" && filteredContributions.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Showing {filteredContributions.length} contribution
              {filteredContributions.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {feedMode === "solve" && filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No issues match your filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDomain(null);
              }}
              className="text-primary font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {feedMode === "solve" && filteredIssues.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Showing {filteredIssues.length} issue
              {filteredIssues.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
