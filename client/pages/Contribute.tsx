import Header from "@/components/Header";
import { FileText, Lightbulb, Search, Zap } from "lucide-react";
import { useState } from "react";

export default function Contribute() {
  const [selected, setSelected] = useState<string | null>(null);

  const contributionTypes = [
    {
      id: "research",
      title: "Research Note",
      description: "Original insights, structured thinking, citations valued",
      icon: Lightbulb,
      effort: "30-120 min",
      examples: ["Literature summary", "Original analysis", "Novel framework"],
    },
    {
      id: "explanation",
      title: "Technical Explanation",
      description: "Deep dives, teaching others, building the commons",
      icon: FileText,
      effort: "20-60 min",
      examples: ["Tutorial", "How-to guide", "Concept breakdown"],
    },
    {
      id: "bug",
      title: "Bug Analysis",
      description: "Root cause investigation, reproducible examples, fixes",
      icon: Search,
      effort: "15-90 min",
      examples: ["Root cause analysis", "Reproduction steps", "Solution proposal"],
    },
    {
      id: "debate",
      title: "Structured Debate",
      description: "Steel-manned critique, evidence required, minds changed",
      icon: Zap,
      effort: "20-45 min",
      examples: ["Counterargument", "Evidence-based critique", "Steel-man response"],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Share Your Knowledge</h1>
          <p className="text-lg text-muted-foreground">
            Choose a contribution type that matches your work. Serious, structured contributions earn reputation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contributionTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selected === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setSelected(isSelected ? null : type.id)}
                className={`text-left p-6 border-2 rounded-xl transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg flex-shrink-0 ${
                      isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {type.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {type.description}
                    </p>

                    <div className="mb-3">
                      <div className="text-xs font-semibold text-primary mb-2">
                        Estimated effort: {type.effort}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example, i) => (
                          <span
                            key={i}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Prepare Your {contributionTypes.find((t) => t.id === selected)?.title}
            </h2>

            <div className="space-y-6 bg-white rounded-lg p-6 border border-border">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Clear, specific title of your contribution"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Primary Domain
                </label>
                <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Select domain...</option>
                  <option>Distributed Systems</option>
                  <option>React</option>
                  <option>Backend Architecture</option>
                  <option>Security</option>
                  <option>DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Content (MDX)
                </label>
                <textarea
                  placeholder="Write your contribution here. Markdown + embedded components supported."
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-64 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum 200 words. References encouraged. Code examples welcome.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Estimated Time Spent (minutes)
                </label>
                <input
                  type="number"
                  placeholder="Self-reported effort"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Helps reviewers assess effort and impact
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  References
                </label>
                <input
                  type="text"
                  placeholder="Links to papers, articles, discussions (comma separated)"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors">
                  Save as Draft
                </button>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        )}

        {!selected && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Select a contribution type above to get started
            </p>
            <p className="text-sm text-muted-foreground">
              Every contribution is peer-reviewed by domain experts
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
