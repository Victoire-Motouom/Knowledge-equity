import Header from "@/components/Header";
import { Edit, Trash2, Eye, Send, Lock } from "lucide-react";
import { useState } from "react";

export default function MyContributions() {
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  const contributions = [
    {
      id: 1,
      title: "Understanding Consensus Mechanisms in Distributed Systems",
      domain: "Distributed Systems",
      type: "research",
      status: "published",
      createdAt: "2 hours ago",
      keGained: 45,
      reviews: 12,
      views: 342,
    },
    {
      id: 2,
      title: "Advanced React Hook Patterns for Complex State Management",
      domain: "React",
      type: "explanation",
      status: "draft",
      createdAt: "Yesterday",
      keGained: 0,
      reviews: 0,
      views: 0,
    },
    {
      id: 3,
      title: "Root Cause Analysis: Memory Leak in Strict Mode",
      domain: "React",
      type: "critique",
      status: "published",
      createdAt: "2 days ago",
      keGained: 32,
      reviews: 8,
      views: 287,
    },
    {
      id: 4,
      title: "Database Indexing Strategy for High-Traffic Applications",
      domain: "Databases",
      type: "explanation",
      status: "published",
      createdAt: "5 days ago",
      keGained: 28,
      reviews: 6,
      views: 156,
    },
    {
      id: 5,
      title: "Securing API Keys in Serverless Environments (WIP)",
      domain: "Security",
      type: "research",
      status: "draft",
      createdAt: "3 days ago",
      keGained: 0,
      reviews: 0,
      views: 0,
    },
    {
      id: 6,
      title: "Why Monoliths Still Win: A Pragmatic Defense",
      domain: "Architecture",
      type: "debate",
      status: "published",
      createdAt: "1 week ago",
      keGained: 38,
      reviews: 15,
      views: 521,
    },
  ];

  const filtered =
    filter === "all"
      ? contributions
      : contributions.filter((c) => c.status === filter);

  const draftCount = contributions.filter((c) => c.status === "draft").length;
  const publishedCount = contributions.filter(
    (c) => c.status === "published",
  ).length;
  const totalKe = contributions
    .filter((c) => c.status === "published")
    .reduce((sum, c) => sum + c.keGained, 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Contributions
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your knowledge contributions and track KE earned
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {publishedCount}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{draftCount}</div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              +{totalKe} KE
            </div>
            <div className="text-sm text-muted-foreground">Total KE Earned</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 border-b border-border pb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "all"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({contributions.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "published"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === "draft"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Contributions List */}
        <div className="space-y-4">
          {filtered.map((contribution) => (
            <div
              key={contribution.id}
              className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                contribution.status === "draft"
                  ? "bg-muted/30 border-muted"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {contribution.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ${
                        contribution.status === "draft"
                          ? "bg-muted text-muted-foreground"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {contribution.status === "draft" ? (
                        <>
                          <Lock className="w-3 h-3 inline mr-1" />
                          Draft
                        </>
                      ) : (
                        "Published"
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {contribution.domain}
                    </span>
                    <span>{contribution.createdAt}</span>
                  </div>

                  {contribution.status === "published" && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-foreground">
                          {contribution.views}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          views
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">
                          {contribution.reviews}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          reviews
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary">
                          +{contribution.keGained}
                        </span>
                        <span className="text-muted-foreground ml-1">KE</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {contribution.status === "published" && (
                    <button
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  {contribution.status === "draft" && (
                    <button
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Publish"
                    >
                      <Send className="w-4 h-4 text-primary" />
                    </button>
                  )}
                  <button
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No {filter !== "all" ? filter : ""} contributions yet
            </p>
            <a
              href="/contribute"
              className="text-primary font-semibold hover:underline"
            >
              Create your first contribution
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
