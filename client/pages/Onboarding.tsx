import Header from "@/components/Header";
import { ChevronRight, CheckCircle2, Users, Zap, Award } from "lucide-react";
import { useState } from "react";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Meet Alice",
      subtitle: "A Backend Engineer",
      content: (
        <div className="space-y-6">
          <div className="bg-primary/10 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">👩‍💻</div>
            <h3 className="text-2xl font-bold text-foreground">Alice</h3>
            <p className="text-muted-foreground">Backend engineer at a growing startup</p>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Alice just fixed a subtle race condition bug in their async task scheduler.
            </p>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-2">What Alice did:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Found a race condition causing random crashes under load</li>
                <li>• Investigated the root cause through logs and debugging</li>
                <li>• Implemented a fix using exponential backoff + retry limits</li>
                <li>• Got it merged into production</li>
              </ul>
            </div>

            <p className="text-muted-foreground italic">
              Now she has a choice: Keep it to herself, or explain it to others.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "She Writes an Explanation",
      subtitle: "The Work Happens in the App",
      content: (
        <div className="space-y-6">
          <div className="bg-amber-500/10 rounded-lg p-6 border border-amber-500/30">
            <p className="text-foreground font-semibold mb-3">
              Alice logs into Knowledge Equity and clicks "New Contribution"
            </p>
            <p className="text-muted-foreground text-sm">
              She doesn't just paste a GitHub link. She explains her work:
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-3">
            <div>
              <div className="font-semibold text-foreground text-sm">Title</div>
              <div className="text-muted-foreground">
                Race condition in async task scheduler
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="font-semibold text-foreground text-sm">Her Explanation</div>
              <div className="text-muted-foreground text-sm space-y-2 mt-2">
                <p>
                  <span className="font-semibold text-foreground">The problem:</span> Task retry handlers
                  were re-queuing themselves endlessly. Under high load, the error queue
                  became a cascade.
                </p>
                <p>
                  <span className="font-semibold text-foreground">Root cause:</span> We
                  didn't cap retries. A single error spawned more errors.
                </p>
                <p>
                  <span className="font-semibold text-foreground">The fix:</span> Exponential
                  backoff + max 3 retries. Simple, proven pattern.
                </p>
                <p>
                  <span className="font-semibold text-foreground">Why it matters:</span> Any
                  queuing system can hit this. Task queues, job schedulers, async handlers.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            ✓ Actual explanation, not just a link
            <br />✓ Shows her thinking process
            <br />✓ Helps others avoid the trap
          </p>
        </div>
      ),
    },
    {
      title: "The Contribution Goes Live",
      subtitle: "Published, But Not Yet Valuable",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Alice publishes. Her contribution appears in the Knowledge Feed.
          </p>

          <div className="bg-muted/30 rounded-lg p-6 border border-border">
            <h4 className="font-semibold text-foreground mb-3">What happens next:</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">1.</span>
                <span className="text-muted-foreground">
                  Other users read it and learn
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">2.</span>
                <span className="text-muted-foreground">
                  Domain experts see it and consider reviewing
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">3.</span>
                <span className="text-muted-foreground">
                  But no reputation is earned yet. That waits for review.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-foreground font-semibold mb-2">Key point:</p>
            <p className="text-sm text-muted-foreground">
              Publishing is just the start. Reputation comes from expert validation.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Bob Reviews It",
      subtitle: "The Expert Validation",
      content: (
        <div className="space-y-6">
          <div className="bg-green-500/10 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h3 className="text-2xl font-bold text-foreground">Bob</h3>
            <p className="text-muted-foreground">Senior backend engineer, KE expert</p>
          </div>

          <p className="text-muted-foreground">
            Bob has deep experience with task scheduling and distributed systems. He sees
            Alice's contribution in his feed.
          </p>

          <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-3">
            <div className="font-semibold text-foreground">Bob's Review:</div>

            <div>
              <div className="text-sm font-medium text-foreground mb-1">Rating</div>
              <div className="text-sm text-primary font-semibold">
                ✓ Confirmed Correct
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-1">Confidence</div>
              <div className="text-sm text-muted-foreground">95% confident</div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-1">Comment</div>
              <div className="text-sm text-muted-foreground italic">
                "Accurate diagnosis and solid fix. The exponential backoff approach is standard
                practice. This pattern applies to any retry handler, not just task queues."
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Bob's review carries weight because:
            <br />✓ He has high KE in the domain
            <br />✓ He's 95% confident
            <br />✓ His comment is specific and technical
          </p>
        </div>
      ),
    },
    {
      title: "Reputation is Calculated",
      subtitle: "The Math Behind the Scenes",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            The system uses a simple, auditable formula to calculate Alice's KE gain:
          </p>

          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20 font-mono text-sm space-y-3">
            <div>
              <div className="text-muted-foreground">Base value (research contribution)</div>
              <div className="text-foreground font-bold">= 30 KE</div>
            </div>

            <div>
              <div className="text-muted-foreground">
                Reviewer weight = log(1 + Bob's KE in domain)
              </div>
              <div className="text-foreground font-bold">
                = log(1 + 1200) = 3.1
              </div>
            </div>

            <div>
              <div className="text-muted-foreground">Bob's confidence</div>
              <div className="text-foreground font-bold">= 0.95</div>
            </div>

            <div className="pt-3 border-t border-primary/20">
              <div className="text-muted-foreground">Alice's KE gain</div>
              <div className="text-lg font-bold text-primary">
                = 30 × 3.1 × 0.95 = 88 KE
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            (This is simplified. Real calculation includes multiple reviews, effort adjustment,
            and historical patterns.)
          </p>

          <p className="text-sm text-muted-foreground italic">
            Key insight: A review from someone with 1200 KE in the domain is worth way more
            than one from a newcomer. Credibility matters.
          </p>
        </div>
      ),
    },
    {
      title: "The Impact Over Time",
      subtitle: "Why This Matters",
      content: (
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-4">
            <h4 className="font-semibold text-foreground">For Alice:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                ✓ She now has <span className="font-semibold text-foreground">88 KE</span>{" "}
                in "Backend" domain
              </li>
              <li>✓ Her profile shows this contribution and the validation</li>
              <li>
                ✓ When she applies for a role, she can point to this as evidence
              </li>
              <li>
                ✓ As she contributes more, her reputation in the domain compounds
              </li>
            </ul>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-4 pt-6">
            <h4 className="font-semibold text-foreground">For Bob:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                ✓ He earns KE for providing a{" "}
                <span className="font-semibold text-foreground">useful review</span>
              </li>
              <li>✓ His reviews are auditable – anyone can see them</li>
              <li>
                ✓ Over time, accurate reviews build his reputation as a trusted
                validator
              </li>
            </ul>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 border border-border space-y-4 pt-6">
            <h4 className="font-semibold text-foreground">For the Community:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                ✓ A real lesson is documented and{" "}
                <span className="font-semibold text-foreground">validated</span>
              </li>
              <li>✓ Future engineers avoid the same trap</li>
              <li>✓ Knowledge builds over time, auditable and permanent</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Why This Works",
      subtitle: "The Full Picture",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "📝",
                title: "Real Work",
                description: "You do actual work. Then explain it.",
              },
              {
                icon: "🧠",
                title: "Explanation",
                description: "The explanation is what gets evaluated, not just the work.",
              },
              {
                icon: "👥",
                title: "Expert Review",
                description: "Domain experts validate the quality.",
              },
              {
                icon: "📊",
                title: "Auditable",
                description: "Every review and score is logged and visible.",
              },
              {
                icon: "🎯",
                title: "Incentive Aligned",
                description: "Good reviewers and contributors build reputation.",
              },
              {
                icon: "🛡️",
                title: "Anti-Gaming",
                description: "Can't fake it with bots or coordinated friends.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg p-4 bg-muted/30 border border-border">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-2">The Net Result</h4>
            <p className="text-muted-foreground">
              Reputation that actually means something. Not followers, not upvotes. Real
              validation from experts in your field.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Ready?",
      subtitle: "You Can Do This Too",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              You Have Knowledge. Share It.
            </h3>
            <p className="text-muted-foreground mb-6">
              Pick one thing you understand deeply. Explain it clearly. Get reviewed by
              experts. Build real reputation.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Next Steps
            </h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">1.</span>
                <span>
                  Go to{" "}
                  <a href="/contribute" className="text-primary font-semibold">
                    Contribute
                  </a>{" "}
                  and pick a contribution type
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">2.</span>
                <span>Write a clear explanation (500+ words, depends on type)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">3.</span>
                <span>Publish and wait for expert reviews (3-7 days typical)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">4.</span>
                <span>
                  Respond to feedback and watch your reputation grow
                </span>
              </li>
            </ol>
          </div>

          <div className="flex gap-4">
            <a
              href="/"
              className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-secondary transition-colors text-center"
            >
              Back to Home
            </a>
            <a
              href="/contribute"
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Start Contributing
            </a>
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Understanding Knowledge Equity
            </h2>
            <span className="text-sm font-semibold text-primary">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {step.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">{step.subtitle}</p>

          <div>{step.content}</div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() =>
              setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
            }
            disabled={currentStep === steps.length - 1}
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
