import Header from "@/components/Header";
import { ArrowLeft, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { useState } from "react";

export default function SubmitReview() {
  const [rating, setRating] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(80);

  // Mock contribution being reviewed
  const contribution = {
    id: "1",
    title: "Understanding Consensus Mechanisms in Distributed Systems",
    author: "alex_researcher",
    domain: "Distributed Systems",
    excerpt:
      "A deep dive into Byzantine Fault Tolerance and practical consensus algorithms used in modern blockchain systems...",
    keGained: 45,
    reviewCount: 12,
    wordCount: 2847,
  };

  const ratingOptions = [
    {
      id: "confirmed_correct",
      title: "Confirmed Correct",
      description: "The explanation is accurate. I can verify the facts.",
      color: "green",
      keMultiplier: "1.0x",
    },
    {
      id: "novel_insight",
      title: "Novel Insight",
      description:
        "This teaches me something new. I hadn't considered this angle before.",
      color: "blue",
      keMultiplier: "1.3x",
    },
    {
      id: "valuable_incomplete",
      title: "Valuable but Incomplete",
      description:
        "Good foundation but missing important context or alternative views.",
      color: "amber",
      keMultiplier: "0.7x",
    },
    {
      id: "incorrect_constructive",
      title: "Incorrect but Constructive",
      description:
        "The analysis has flaws, but the effort is valuable for discussion.",
      color: "orange",
      keMultiplier: "0.4x",
    },
    {
      id: "not_credible",
      title: "Not Credible",
      description:
        "Lacks evidence or contains significant errors. Should be rejected.",
      color: "red",
      keMultiplier: "0.0x",
    },
  ];

  const selectedRating = ratingOptions.find((r) => r.id === rating);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a
          href={`/contribution/${contribution.id}`}
          className="flex items-center gap-2 text-primary font-medium mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to contribution
        </a>

        {/* Contribution Context */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                You're reviewing
              </h3>
              <p className="text-lg font-bold text-foreground mb-2">
                {contribution.title}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>By @{contribution.author}</span>
                <span>•</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  {contribution.domain}
                </span>
                <span>•</span>
                <span>{contribution.wordCount} words</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-primary">
                +{contribution.keGained}
              </div>
              <div className="text-xs text-muted-foreground">KE (current)</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Rating */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                1. How would you rate this contribution?
              </h2>

              <div className="space-y-3">
                {ratingOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setRating(option.id)}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                      rating === option.id
                        ? `border-${option.color}-500 bg-${option.color}-500/5`
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={rating === option.id}
                        onChange={() => setRating(option.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {option.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          If approved: +{option.keMultiplier} KE impact
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Confidence */}
            {rating && (
              <section className="animate-slide-up">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  2. How confident are you?
                </h2>

                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your review weights more heavily if you have high confidence
                    in your judgment. Only rate your actual certainty.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={confidence}
                      onChange={(e) => setConfidence(parseInt(e.target.value))}
                      className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Very unsure
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          confidence < 40
                            ? "text-destructive"
                            : confidence < 70
                              ? "text-amber-500"
                              : "text-green-600"
                        }`}
                      >
                        {confidence}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Very confident
                      </span>
                    </div>

                    <div
                      className={`rounded-lg p-3 text-sm ${
                        confidence < 40
                          ? "bg-destructive/10 text-destructive"
                          : confidence < 70
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-green-600/10 text-green-700"
                      }`}
                    >
                      {confidence < 40 && (
                        <>
                          <span className="font-semibold">Low confidence:</span>{" "}
                          Your review will have low weight. Only submit if you
                          really need to flag an issue.
                        </>
                      )}
                      {confidence >= 40 && confidence < 70 && (
                        <>
                          <span className="font-semibold">
                            Moderate confidence:
                          </span>{" "}
                          Your review contributes meaningfully to the score.
                        </>
                      )}
                      {confidence >= 70 && (
                        <>
                          <span className="font-semibold">
                            High confidence:
                          </span>{" "}
                          Your review has strong weight. Reviewers with high KE
                          in this domain influence final scores significantly.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Comment */}
            {rating && (
              <section className="animate-slide-up">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  3. Explain your reasoning
                </h2>

                <p className="text-muted-foreground mb-4">
                  This comment helps the author improve and helps other
                  reviewers calibrate their assessment. Be specific.
                </p>

                <textarea
                  placeholder={`Be specific. Examples:

If "Confirmed Correct":
- "Accurate explanation of Raft consensus. The performance section is particularly good."

If "Novel Insight":
- "I hadn't thought about the cost analysis angle. Changes how I think about microservices."

If "Valuable but Incomplete":
- "Strong foundation, but missing discussion of failure modes and recovery."

If "Incorrect":
- "The claim about O(N²) complexity is wrong. PBFT is O(N²) messages but lower latency than..."

Always: Be concrete. Cite specific sections. Show you read it.`}
                  rows={8}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <p className="text-xs text-muted-foreground mt-2">
                  Minimum 50 characters. Be thoughtful – this is part of your
                  reputation too.
                </p>
              </section>
            )}

            {/* Submit */}
            {rating && (
              <div className="flex gap-4 pt-6 border-t border-border animate-slide-up">
                <button className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-secondary transition-colors">
                  Cancel
                </button>
                <button className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Submit Review
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Info */}
            <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Important
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold flex-shrink-0">
                    •
                  </span>
                  <span>You can't review your own work</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold flex-shrink-0">
                    •
                  </span>
                  <span>Your reviews are public and auditable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold flex-shrink-0">
                    •
                  </span>
                  <span>Your KE is weighted by your domain expertise</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold flex-shrink-0">
                    •
                  </span>
                  <span>Low-quality reviews harm your reputation</span>
                </li>
              </ul>
            </div>

            {/* How Reviews Work */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                How Your Review Counts
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-foreground mb-1">
                    Your weight in this domain
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on your KE in Distributed Systems
                  </div>
                  <div className="text-lg font-bold text-primary mt-1">
                    Medium (950 KE)
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="font-medium text-foreground mb-1">
                    Your confidence adjustment
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on {confidence}% confidence
                  </div>
                  <div className="text-lg font-bold text-primary mt-1">
                    {confidence >= 70 ? "Full weight" : `${confidence}% weight`}
                  </div>
                </div>
              </div>
            </div>

            {/* Example Good Review */}
            <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Example Good Review
              </h3>
              <p className="text-sm text-muted-foreground">
                "Accurate breakdown of Raft consensus. The explanation of log
                replication is particularly clear. One minor point: the
                performance comparison with Paxos would be stronger with latency
                numbers, not just message complexity."
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
