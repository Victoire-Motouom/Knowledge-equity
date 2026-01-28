import Header from "@/components/Header";
import {
  ChevronDown,
  Zap,
  Users,
  TrendingUp,
  Shield,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

export default function HowItWorks() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const steps = [
    {
      number: 1,
      title: "Share Deep Knowledge",
      description:
        "Write research notes, technical explanations, bug analyses, or structured debates. Be specific, thorough, and cite your sources.",
      icon: BookOpen,
    },
    {
      number: 2,
      title: "Get Expert Review",
      description:
        "Domain experts in your field review your contribution. They rate it and provide feedback. Multiple reviewers validate quality.",
      icon: Users,
    },
    {
      number: 3,
      title: "Earn Knowledge Equity",
      description:
        "Your contribution value is converted to KE (Knowledge Equity). Reviewers who are themselves highly credible add more weight.",
      icon: Zap,
    },
    {
      number: 4,
      title: "Build Reputation",
      description:
        "Accumulate KE in specific domains. Climb the leaderboard. Become a trusted voice in your field of expertise.",
      icon: TrendingUp,
    },
  ];

  const faqs = [
    {
      question: "What is Knowledge Equity (KE)?",
      answer:
        "Knowledge Equity is a reputation system that measures the value of your contributions to the platform. Unlike follower counts or upvotes, KE is earned through validated, expert-reviewed content. One expert's review of your work is worth more than many casual votes.",
    },
    {
      question: "How is my KE calculated?",
      answer:
        "Your KE gain from a contribution is: base_value(type) × reviewer_weight × reviewer_confidence. The reviewer_weight is log(1 + reviewer_KE_in_domain), meaning reviews from more credible experts in that domain count more. This creates a defensible, auditable reputation system.",
    },
    {
      question: "Can I lose KE?",
      answer:
        "KE generally doesn't decrease, but contributions can be flagged for low quality or policy violations. The KE ledger is immutable - all changes are logged so you can see exactly why your score changed.",
    },
    {
      question: "Who can review contributions?",
      answer:
        "Any member can submit reviews, but the KE you gain depends on the reviewer's credibility. New members' reviews contribute less weight. As you build your own KE through contributions, your reviews carry more authority.",
    },
    {
      question: "What counts as a good contribution?",
      answer:
        "Good contributions are: specific (not vague), thorough (well-researched), referenced (links to sources), and original (your own thinking). Minimum 200 words. Plagiarism, spam, and lazy work are rejected in review.",
    },
    {
      question: "How long does review take?",
      answer:
        "Most contributions are reviewed within 3-7 days. Popular domains might be faster. You'll see reviews come in as they arrive. You can respond to reviewer feedback.",
    },
    {
      question: "Can I edit my contribution after publishing?",
      answer:
        "Yes, you can edit published contributions. Major edits re-trigger review. Minor typo fixes don't. Your contribution's edit history is visible to maintain trust.",
    },
    {
      question: "What happens to my drafts?",
      answer:
        "Drafts are private to you. You can save and edit them indefinitely. They don't earn KE until published. Only you can see your drafts.",
    },
    {
      question: "Is this anonymous?",
      answer:
        "No. One account = one persistent identity. Pseudonyms are fine (you don't need a real name), but you can't be anonymous. This prevents gaming the system and ensures accountability.",
    },
    {
      question: "How do you prevent review rings?",
      answer:
        "The system detects when the same people frequently review each other. Reviews from suspected rings are weighted lower or flagged. Also, your reviews are auditable - anyone can see who reviewed what and when.",
    },
  ];

  const metrics = [
    {
      title: "Min Word Count",
      value: "200",
      description: "Per contribution (prevents spam)",
    },
    {
      title: "Review Window",
      value: "3-7 days",
      description: "Average time to first review",
    },
    {
      title: "Min Reviews",
      value: "1",
      description: "To calculate reputation impact",
    },
    {
      title: "Reviewer Weight",
      value: "log(1+KE)",
      description: "Formula for credibility factor",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Knowledge Equity Works
          </h1>
          <p className="text-xl text-muted-foreground">
            A protocol for credible knowledge. Not clicks, not followers—actual
            contribution validated by experts.
          </p>
        </div>

        {/* Steps Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            The 4-Step Process
          </h2>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg">
                      {step.description}
                    </p>

                    {index < steps.length - 1 && (
                      <div className="mt-6 h-12 w-1 bg-gradient-to-b from-primary/50 to-primary/10 ml-8" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Key Metrics */}
        <section className="mb-16 bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Key Metrics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-primary mb-2">
                  {metric.value}
                </div>
                <div className="font-semibold text-foreground text-sm mb-1">
                  {metric.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why This Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Why This Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "🔐",
                title: "Postgres-First Design",
                description:
                  "Scalable, queryable, auditable reputation graphs. Not a blockchain.",
              },
              {
                icon: "📋",
                title: "Ledger-Based Reputation",
                description:
                  "Every KE change is logged. You can see why your score changed.",
              },
              {
                icon: "⚖️",
                title: "Review-Weighted Validation",
                description:
                  "Opinions weighted by credibility, not popularity. Anti-gaming by design.",
              },
              {
                icon: "📝",
                title: "Content-First UX",
                description:
                  "Long-form thinking encouraged. Spam naturally deprioritized.",
              },
              {
                icon: "🎯",
                title: "Persistent Identity",
                description:
                  "One account, one identity. Pseudonyms allowed. Accountability enforced.",
              },
              {
                icon: "🛡️",
                title: "Ring Detection",
                description:
                  "System catches when same people vote for each other constantly.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition-colors text-left"
                >
                  <h3 className="font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedFaq === index && (
                  <div className="px-6 py-4 bg-muted/30 border-t border-border">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Ready to build your reputation?
          </h3>
          <p className="text-muted-foreground mb-6">
            Share your first contribution and start earning Knowledge Equity
          </p>
          <a
            href="/contribute"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-block"
          >
            Create Contribution
          </a>
        </div>
      </main>
    </div>
  );
}
