import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Award, Zap, Shield } from "lucide-react";
import Header from "@/components/Header";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                Reputation Earned,
                <span className="text-primary"> Not Clicked</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Share deep contributions. Get credible review. Build persistent
                reputation through actual knowledge equity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/feed"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 w-fit"
              >
                Explore Feed
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contribute"
                className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
              >
                Share Knowledge
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary">1K+</div>
                <div className="text-sm text-muted-foreground">
                  Contributions
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Active Members
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">
                  Knowledge Domains
                </div>
              </div>
            </div>
          </div>

          {/* Illustration/Visual */}
          <div className="relative h-96 md:h-full flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
            <div className="relative z-10 space-y-4">
              <div className="space-y-3">
                <div className="bg-white border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Research Note
                      </div>
                      <div className="text-xs text-muted-foreground">
                        By alex_researcher
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="text-sm font-semibold text-primary">
                        +45 KE
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Bug Analysis
                      </div>
                      <div className="text-xs text-muted-foreground">
                        By sam_coder
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="text-sm font-semibold text-accent">
                        +32 KE
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        Technical Debate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        By jordan_dev
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="text-sm font-semibold text-primary">
                        +28 KE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How Knowledge Equity Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A protocol designed for truth, not popularity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Credible Review
              </h3>
              <p className="text-muted-foreground">
                Expert reviewers validate contributions. Review quality scored.
                Self-review prevented.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Earned Reputation
              </h3>
              <p className="text-muted-foreground">
                Knowledge Equity grows based on contribution value and reviewer
                expertise.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Persistent Identity
              </h3>
              <p className="text-muted-foreground">
                One account, one identity. Pseudonyms allowed. Accountability
                enforced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contribution Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Deep Contributions
          </h2>
          <p className="text-lg text-muted-foreground">
            Think: HN + StackOverflow + GitHub PR review
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Research Notes",
              description:
                "Structured thinking. Original insights. Citations valued.",
              icon: "📚",
            },
            {
              title: "Technical Explanations",
              description: "Deep dives. Teaching others. Building the commons.",
              icon: "🔬",
            },
            {
              title: "Bug Analysis",
              description:
                "Root cause, not symptoms. Reproducible examples. Fixes.",
              icon: "🔍",
            },
            {
              title: "Structured Debates",
              description:
                "Steel-manned critique. Evidence required. Minds changed.",
              icon: "⚔️",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 border border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Build Your Reputation?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start with a contribution. Get reviewed by experts. Grow your
            Knowledge Equity.
          </p>
          <Link
            to="/contribute"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            Share Your First Contribution
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
