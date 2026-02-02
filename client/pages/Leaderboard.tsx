import EmojiAvatar from "@/components/EmojiAvatar";
import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trophy, TrendingUp, Star, Sparkles, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DEFAULT_DOMAINS } from "@/lib/domains";
import type { LeaderboardEntry, LeaderboardResponse } from "@shared/api";

export default function Leaderboard() {
  const [tab, setTab] = useState<"global" | "domain">("global");
  const [selectedDomain, setSelectedDomain] = useState("all");

  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const domainParam = useMemo(() => {
    if (tab !== "domain") return undefined;
    if (!selectedDomain || selectedDomain === "all") return undefined;
    return selectedDomain;
  }, [tab, selectedDomain]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const url = new URL("/api/leaderboard", window.location.origin);
    if (domainParam) url.searchParams.set("domain", domainParam);

    fetch(url.toString())
      .then((r) => r.json())
      .then((data: LeaderboardResponse) => {
        if (!mounted) return;
        setLeaders(data.leaders || []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load leaderboard");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [domainParam]);

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 lg:pb-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-10 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Leaderboard
              </div>
              <h1 className="text-4xl font-semibold text-foreground mt-3 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Knowledge Leaders
              </h1>
              <p className="text-lg text-muted-foreground">
                The most trusted contributors shaping the commons.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3">
              <div className="text-xs text-muted-foreground">Total leaders</div>
              <div className="text-2xl font-semibold text-foreground">
                {leaders.length}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Scope
            </div>
            <SegmentedControl
              value={tab}
              onChange={(v) => setTab(v)}
              options={[
                { value: "global", label: "Global" },
                { value: "domain", label: "By Domain" },
              ]}
            />
          </div>
        </section>

        {/* Domain Filter (when in domain tab) */}
        {tab === "domain" && (
          <div className="glass-panel rounded-2xl p-5 mb-8">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Filter by Domain
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSelectedDomain("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDomain === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Global
              </button>
              <div className="w-full">
                <input
                  type="text"
                  value={selectedDomain === "all" ? "" : selectedDomain}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedDomain(v.trim().length ? v : "all");
                  }}
                  placeholder="Type a domain (e.g., React)"
                  inputMode="search"
                  className="w-full px-4 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {selectedDomain !== "all" &&
                  selectedDomain.trim().length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DEFAULT_DOMAINS.filter((d) =>
                        selectedDomain === "all" || !selectedDomain
                          ? true
                          : d
                              .toLowerCase()
                              .includes(selectedDomain.toLowerCase()),
                      )
                        .slice(0, 12)
                        .map((d) => {
                          const selected =
                            selectedDomain !== "all" &&
                            d.toLowerCase() === selectedDomain.toLowerCase();
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                import("@/lib/haptics").then(({ haptic }) =>
                                  haptic("tap"),
                                );
                                setSelectedDomain(d);
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
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-sm text-muted-foreground">
            Loading leaderboard…
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load leaderboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && leaders.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No leaderboard entries yet.
          </div>
        )}

        {/* Leaders List */}
        <div className="space-y-4">
          {leaders.map((leader) => (
            <div
              key={`${leader.rank}-${leader.handle}`}
              className="glass-panel rounded-2xl p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {leader.badge || "#"}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        #{leader.rank}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground inline-flex items-center gap-2">
                        <EmojiAvatar handle={leader.handle} size="sm" />@
                        {leader.handle}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(leader.domains || []).slice(0, 6).map((domain) => (
                          <span
                            key={domain}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold text-primary">
                        {leader.ke.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Knowledge Equity
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 text-sm text-muted-foreground pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>{leader.contributions} contributions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>{leader.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
