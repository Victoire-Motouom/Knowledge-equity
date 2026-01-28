import Header from "@/components/Header";
import {
  TrendingUp,
  Award,
  Zap,
  MessageSquare,
  ThumbsUp,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

export default function Feed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const allDomains = [
    "Distributed Systems",
    "React",
    "Architecture",
    "Backend",
    "Security",
  ];
  const allTypes = ["research", "explanation", "critique", "debate"];

  const allContributions = [
    {
      id: 1,
      title: "Understanding Consensus Mechanisms in Distributed Systems",
      author: "alex_researcher",
      domain: "Distributed Systems",
      type: "research",
      icon: Zap,
      excerpt:
        "A deep dive into Byzantine Fault Tolerance and practical consensus algorithms used in modern blockchain systems...",
      reviews: 12,
      keGained: 45,
      createdAt: "2 hours ago",
    },
    {
      id: 2,
      title: "Root Cause Analysis: Memory Leak in React Strict Mode",
      author: "sam_coder",
      domain: "React",
      type: "critique",
      icon: Award,
      excerpt:
        "Discovered and documented a subtle memory leak pattern that only appears in development mode with Strict Mode enabled...",
      reviews: 8,
      keGained: 32,
      createdAt: "5 hours ago",
    },
    {
      id: 3,
      title: "Why Monoliths Still Win: A Pragmatic Defense",
      author: "jordan_dev",
      domain: "Architecture",
      type: "debate",
      icon: TrendingUp,
      excerpt:
        "An evidence-based argument for when monolithic architecture outperforms microservices, with real cost analysis...",
      reviews: 24,
      keGained: 28,
      createdAt: "1 day ago",
    },
    {
      id: 4,
      title: "Advanced TypeScript Patterns for Large Codebases",
      author: "research_lead",
      domain: "Backend",
      type: "explanation",
      icon: Zap,
      excerpt:
        "A comprehensive guide to advanced TypeScript patterns that scale with your codebase complexity...",
      reviews: 6,
      keGained: 22,
      createdAt: "2 days ago",
    },
    {
      id: 5,
      title: "Database Indexing Strategy That Actually Works",
      author: "distributed_sys_expert",
      domain: "Backend",
      type: "research",
      icon: Award,
      excerpt:
        "Real-world indexing strategies backed by performance benchmarks and cost analysis...",
      reviews: 9,
      keGained: 38,
      createdAt: "3 days ago",
    },
    {
      id: 6,
      title: "Security Audit: Common OAuth 2.0 Misconfigurations",
      author: "security_expert",
      domain: "Security",
      type: "critique",
      icon: Award,
      excerpt:
        "Analysis of real-world OAuth misconfigurations and how to audit your implementation...",
      reviews: 11,
      keGained: 42,
      createdAt: "4 days ago",
    },
  ];

  const contributions = allContributions.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain =
      selectedDomain === null || c.domain === selectedDomain;
    const matchesType = selectedType === null || c.type === selectedType;

    return matchesSearch && matchesDomain && matchesType;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Knowledge Feed
          </h1>
          <p className="text-muted-foreground">
            The newest serious contributions from our community
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contributions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Domain Filter */}
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">
              Filter by Domain
            </div>
            <div className="flex flex-wrap gap-2">
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
              {allDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedDomain === domain
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">
              Filter by Type
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
              {allTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedDomain || selectedType) && (
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchTerm && (
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>"{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-primary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
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
                  setSearchTerm("");
                  setSelectedDomain(null);
                  setSelectedType(null);
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {contributions.map((contribution) => {
            const Icon = contribution.icon;
            return (
              <div
                key={contribution.id}
                className="border border-border rounded-xl p-6 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg h-fit">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                          {contribution.title}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium">
                            {contribution.author}
                          </span>
                          <span>•</span>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                            {contribution.domain}
                          </span>
                          <span>•</span>
                          <span>{contribution.createdAt}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-primary">
                          +{contribution.keGained}
                        </div>
                        <div className="text-xs text-muted-foreground">KE</div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {contribution.excerpt}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>{contribution.reviews} reviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Validated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {contributions.length === 0 && (
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

        {contributions.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Showing {contributions.length} contribution
              {contributions.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
