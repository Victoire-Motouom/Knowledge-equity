import Header from "@/components/Header";
import { Trophy, TrendingUp, Star } from "lucide-react";
import { useState } from "react";

export default function Leaderboard() {
  const [tab, setTab] = useState<"global" | "domain">("global");
  const [selectedDomain, setSelectedDomain] = useState("all");

  const globalLeaders = [
    {
      rank: 1,
      handle: "alex_researcher",
      ke: 4250,
      contributions: 28,
      reviews: 67,
      domains: ["Distributed Systems", "Architecture"],
      badge: "🏆",
    },
    {
      rank: 2,
      handle: "sam_coder",
      ke: 3820,
      contributions: 22,
      reviews: 54,
      domains: ["React", "Performance"],
      badge: "🥈",
    },
    {
      rank: 3,
      handle: "jordan_dev",
      ke: 3540,
      contributions: 19,
      reviews: 48,
      domains: ["Architecture", "DevOps"],
      badge: "🥉",
    },
    {
      rank: 4,
      handle: "research_lead",
      ke: 3200,
      contributions: 25,
      reviews: 42,
      domains: ["Security", "Cryptography"],
      badge: "⭐",
    },
    {
      rank: 5,
      handle: "distributed_sys_expert",
      ke: 2950,
      contributions: 18,
      reviews: 38,
      domains: ["Distributed Systems", "Consensus"],
      badge: "⭐",
    },
    {
      rank: 6,
      handle: "backend_architect",
      ke: 2680,
      contributions: 16,
      reviews: 35,
      domains: ["Backend", "Databases"],
      badge: "⭐",
    },
    {
      rank: 7,
      handle: "frontend_expert",
      ke: 2420,
      contributions: 14,
      reviews: 31,
      domains: ["React", "Web Performance"],
      badge: "⭐",
    },
    {
      rank: 8,
      handle: "devops_master",
      ke: 2180,
      contributions: 12,
      reviews: 28,
      domains: ["DevOps", "Infrastructure"],
      badge: "⭐",
    },
  ];

  const domainLeaders = {
    "Distributed Systems": [
      { rank: 1, handle: "alex_researcher", ke: 1850, contributions: 12 },
      { rank: 2, handle: "distributed_sys_expert", ke: 1620, contributions: 9 },
      { rank: 3, handle: "consensus_guru", ke: 1420, contributions: 8 },
    ],
    React: [
      { rank: 1, handle: "sam_coder", ke: 1540, contributions: 10 },
      { rank: 2, handle: "frontend_expert", ke: 1320, contributions: 9 },
      { rank: 3, handle: "react_wizard", ke: 1100, contributions: 7 },
    ],
    Security: [
      { rank: 1, handle: "research_lead", ke: 1680, contributions: 11 },
      { rank: 2, handle: "security_expert", ke: 1450, contributions: 9 },
      { rank: 3, handle: "crypto_specialist", ke: 1200, contributions: 8 },
    ],
  };

  const domains = [
    "all",
    "Distributed Systems",
    "React",
    "Security",
    "Backend",
    "DevOps",
  ];

  const displayLeaders =
    selectedDomain === "all"
      ? globalLeaders
      : domainLeaders[selectedDomain as keyof typeof domainLeaders] || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            Knowledge Leaders
          </h1>
          <p className="text-lg text-muted-foreground">
            Top contributors building the knowledge commons
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setTab("global")}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
              tab === "global"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Global Rankings
          </button>
          <button
            onClick={() => setTab("domain")}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
              tab === "domain"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            By Domain
          </button>
        </div>

        {/* Domain Filter (when in domain tab) */}
        {tab === "domain" && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-3">
              Filter by Domain
            </label>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDomain === domain
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {domain === "all" ? "Global" : domain}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Leaders List */}
        <div className="space-y-4">
          {displayLeaders.map((leader) => (
            <div
              key={leader.rank}
              className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex items-start gap-6">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {leader.badge}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        #{leader.rank}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        @{leader.handle}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {leader.domains.map((domain) => (
                          <span
                            key={domain}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* KE Score */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold text-primary">
                        {leader.ke.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Knowledge Equity
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
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

        {/* Info Box */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6">
          <h3 className="font-bold text-foreground mb-2">How Rankings Work</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • Knowledge Equity is earned through validated contributions
            </li>
            <li>
              • Expert reviews weight heavily based on reviewer credibility
            </li>
            <li>• Domain-specific KE tracks expertise in focused areas</li>
            <li>• Global ranking aggregates all domain contributions</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
