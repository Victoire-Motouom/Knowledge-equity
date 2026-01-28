import Header from "@/components/Header";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Award,
  Clock,
  Globe,
  Star,
} from "lucide-react";

export default function ContributionDetail() {
  const { id } = useParams();

  // Mock contribution data
  const contribution = {
    id,
    title:
      "Understanding Consensus Mechanisms in Distributed Systems",
    author: "alex_researcher",
    domain: "Distributed Systems",
    type: "research",
    createdAt: "2 hours ago",
    updated: "2 hours ago",
    effortMinutes: 120,
    content: `
# Understanding Consensus Mechanisms

Consensus mechanisms are fundamental to distributed systems...

## Byzantine Fault Tolerance

The Byzantine Generals Problem, first introduced by Lamport et al...

## Practical Algorithms

### Raft
Raft provides a more understandable alternative to Paxos...

### PBFT
Practical Byzantine Fault Tolerance offers...
    `,
    references: [
      "The Byzantine Generals Problem - Lamport, Shostak, Pease",
      "Raft: In Search of an Understandable Consensus Algorithm",
      "PBFT: Practical Byzantine Fault Tolerance",
    ],
    stats: {
      views: 342,
      reviews: 12,
      keGained: 45,
      avgConfidence: 4.2,
    },
  };

  const reviews = [
    {
      reviewer: "senior_architect",
      rating: "confirmed_correct",
      confidence: 0.95,
      comment:
        "Excellent breakdown of consensus mechanisms. The Raft explanation is particularly clear. Well researched.",
      keAwarded: 15,
    },
    {
      reviewer: "research_lead",
      rating: "novel_insight",
      confidence: 0.85,
      comment:
        "The comparison table between Raft and PBFT is novel. Haven't seen this framing before.",
      keAwarded: 18,
    },
    {
      reviewer: "distributed_sys_expert",
      rating: "valuable_but_incomplete",
      confidence: 0.9,
      comment:
        "Strong foundational work. Would benefit from discussion of leader election and failure recovery.",
      keAwarded: 12,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded">
              {contribution.type}
            </span>
            <span className="text-sm font-semibold bg-secondary text-secondary-foreground px-3 py-1 rounded">
              {contribution.domain}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {contribution.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div>
              <span className="font-semibold text-foreground">
                @{contribution.author}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{contribution.createdAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{contribution.effortMinutes} minutes effort</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                {contribution.stats.views}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="bg-accent/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">
                {contribution.stats.reviews}
              </div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                +{contribution.stats.keGained}
              </div>
              <div className="text-xs text-muted-foreground">KE Gained</div>
            </div>
            <div className="bg-accent/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">
                {contribution.stats.avgConfidence.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Confidence</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8 pb-8 border-b border-border">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>Validate</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Review</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors ml-auto">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Content */}
            <div className="prose prose-sm max-w-none mb-8">
              <div className="text-foreground whitespace-pre-wrap">
                {contribution.content}
              </div>
            </div>

            {/* References */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                References
              </h2>
              <ul className="space-y-2">
                {contribution.references.map((ref, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    • {ref}
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div
                    key={i}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-semibold text-foreground">
                          @{review.reviewer}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {(review.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-primary">
                          +{review.keAwarded}
                        </div>
                        <div className="text-xs text-muted-foreground">KE</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                        {review.rating.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-foreground text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary text-lg">
                    {contribution.author[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    @{contribution.author}
                  </div>
                  <div className="text-xs text-muted-foreground">Author</div>
                </div>
              </div>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                View Profile
              </button>
            </div>

            {/* Quality Metrics */}
            <div className="border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Quality
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Review Quality
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < 4 ? "bg-primary" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">
                    Community Validation
                  </div>
                  <div className="text-lg font-bold text-primary">92%</div>
                </div>
              </div>
            </div>

            {/* Submit Review */}
            <div className="border border-primary/30 bg-primary/5 rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-3">Submit Your Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Expert reviews help build knowledge equity. Only domain experts
                should review.
              </p>
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Write Review
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
