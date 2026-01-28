import Header from "@/components/Header";
import { FileText, Lightbulb, Search, Zap, AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export default function Contribute() {
  const [selected, setSelected] = useState<string | null>(null);

  const contributionTypes = [
    {
      id: "research",
      title: "Research Note",
      subtitle: "Share original analysis and thinking",
      description: "You've done research, read papers, analyzed data, or synthesized ideas. Now explain what you learned and why it matters.",
      icon: Lightbulb,
      effort: "30-120 min",
      whatToInclude: [
        "The problem or topic you investigated",
        "What you discovered (the insight)",
        "Why this matters to others",
        "Citations and sources",
        "Your own analysis (not just summaries)",
      ],
      example: "Analyzing consensus algorithms in Raft vs PBFT, including performance tradeoffs and when to use each",
      minWords: 500,
    },
    {
      id: "explanation",
      title: "Technical Explanation",
      subtitle: "Teach others something you understand deeply",
      description: "You know how something works. Write it clearly so others can actually understand it. Teaching is work.",
      icon: FileText,
      effort: "20-60 min",
      whatToInclude: [
        "The concept or problem being explained",
        "Why someone should care",
        "Clear step-by-step breakdown",
        "Real-world examples or use cases",
        "Common misconceptions (what NOT to do)",
      ],
      example: "How React hooks work under the hood: closure basics, the rules, and why they matter",
      minWords: 400,
    },
    {
      id: "bug",
      title: "Bug Analysis",
      subtitle: "Explain a real problem and how to fix it",
      description: "You found, debugged, or fixed a real issue. Explain the root cause clearly so others can avoid the same trap.",
      icon: Search,
      effort: "15-90 min",
      whatToInclude: [
        "The symptom (what went wrong)",
        "Why it happened (root cause investigation)",
        "How you found it (your debugging process)",
        "The fix and why it works",
        "Links to code/PR if public",
      ],
      example: "Memory leak in async task scheduler: why it happened, reproduction steps, and the fix",
      minWords: 300,
    },
    {
      id: "debate",
      title: "Structured Argument",
      subtitle: "Make a careful, evidence-based case",
      description: "You disagree with conventional wisdom or have a contrarian take. Explain it rigorously with evidence.",
      icon: Zap,
      effort: "20-45 min",
      whatToInclude: [
        "The claim you're making",
        "The common assumption you're pushing back on",
        "Evidence that supports your claim",
        "Honest limitations of your argument",
        "When you're wrong (what would prove it)",
      ],
      example: "Why monoliths still win: cost analysis, when microservices fail, and what's being optimized for",
      minWords: 400,
    },
  ];

  const type = contributionTypes.find((t) => t.id === selected);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selected ? (
          <>
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-3">Share Knowledge</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                You did real work. Now explain it. Help others understand. Build your reputation.
              </p>
            </div>

            <div className="mb-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                What We're Looking For
              </h3>
              <p className="text-muted-foreground text-sm">
                Not links. Not screenshots. Not "check my GitHub." Real explanation of real work.
                We want to understand what you did and why it matters. That's what gets reviewed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {contributionTypes.map((type) => {
                const Icon = type.icon;

                return (
                  <button
                    key={type.id}
                    onClick={() => setSelected(type.id)}
                    className="text-left p-6 border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg flex-shrink-0 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {type.title}
                        </h3>
                        <p className="text-sm text-primary font-medium mb-2">
                          {type.subtitle}
                        </p>
                        <p className="text-muted-foreground text-sm mb-3">
                          {type.description}
                        </p>

                        <div className="pt-3 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-2">
                            Example: {type.example}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Typical: {type.effort} • Min {type.minWords} words
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="animate-slide-up">
            <button
              onClick={() => setSelected(null)}
              className="mb-6 text-primary font-medium hover:underline text-sm"
            >
              ← Back to types
            </button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">{type?.title}</h1>
              <p className="text-lg text-muted-foreground">{type?.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6 bg-white rounded-lg p-6 border border-border">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g., ${type?.example}`}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific. Avoid vague titles. Someone should understand what you're talking about immediately.
                  </p>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Primary Domain *
                  </label>
                  <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Select domain...</option>
                    <option>Distributed Systems</option>
                    <option>React</option>
                    <option>Backend Architecture</option>
                    <option>Security</option>
                    <option>DevOps</option>
                    <option>Databases</option>
                    <option>Machine Learning</option>
                    <option>Web Performance</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviewers have expertise in specific domains. Pick the one where experts should judge your work.
                  </p>
                </div>

                {/* Main Content */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Your Explanation *
                  </label>
                  <textarea
                    placeholder={`Explain your ${type?.title.toLowerCase()}.\n\nFor example:\n- What you discovered / did / argue\n- Why it matters\n- How you arrived at this\n- Evidence or examples\n\nMinimum ${type?.minWords} words. Be clear and specific.`}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-64 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is what reviewers read. Be thorough. Link to code, papers, or examples if helpful. Markdown supported.
                  </p>
                </div>

                {/* External Links */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    External Evidence (Optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="GitHub PR link, research paper, etc."
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Links help prove your work is real. But the explanation inside this form is what gets reviewed.
                    </p>
                  </div>
                </div>

                {/* Effort */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    How long did this take you? *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="45"
                      className="w-24 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>minutes</option>
                      <option>hours</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviewers consider effort when scoring. A 5-hour deep dive deserves different KE than a quick fix.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 border-t border-border">
                  <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
                    Save as Draft
                  </button>
                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Publish
                  </button>
                </div>
              </div>

              {/* Sidebar Guide */}
              <div className="space-y-6">
                {/* What to Include */}
                <div className="border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Include This
                  </h3>
                  <ul className="space-y-2">
                    {type?.whatToInclude.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary font-bold flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What NOT to do */}
                <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Don't Just Post
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "A GitHub link with no explanation",
                      "Copy-paste from docs",
                      "Marketing speak / hype",
                      "Unsubstantiated opinions",
                      "Less than minimum word count",
                    ].map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-destructive font-bold flex-shrink-0">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Example Stats */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3">Typical Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="font-medium text-foreground">{type?.minWords}+ words</div>
                      <div className="text-xs text-muted-foreground">Minimum length</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{type?.effort}</div>
                      <div className="text-xs text-muted-foreground">Typical effort</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">3-7 days</div>
                      <div className="text-xs text-muted-foreground">To first review</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
