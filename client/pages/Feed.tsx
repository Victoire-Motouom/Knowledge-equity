import Header from "@/components/Header";
import { TrendingUp, Award, Zap, MessageSquare, ThumbsUp } from "lucide-react";

export default function Feed() {
  const contributions = [
    {
      id: 1,
      title: "Understanding Consensus Mechanisms in Distributed Systems",
      author: "alex_researcher",
      domain: "Distributed Systems",
      type: "research",
      icon: Zap,
      excerpt: "A deep dive into Byzantine Fault Tolerance and practical consensus algorithms used in modern blockchain systems...",
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
      excerpt: "Discovered and documented a subtle memory leak pattern that only appears in development mode with Strict Mode enabled...",
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
      excerpt: "An evidence-based argument for when monolithic architecture outperforms microservices, with real cost analysis...",
      reviews: 24,
      keGained: 28,
      createdAt: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Knowledge Feed</h1>
          <p className="text-muted-foreground">
            The newest serious contributions from our community
          </p>
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
                          <span className="font-medium">{contribution.author}</span>
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

        <div className="text-center py-12">
          <p className="text-muted-foreground">
            More contributions coming soon. Start by{" "}
            <a href="/contribute" className="text-primary font-semibold hover:underline">
              sharing your knowledge
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
