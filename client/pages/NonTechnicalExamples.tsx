import Header from "@/components/Header";
import { CheckCircle2, Lightbulb } from "lucide-react";

export default function NonTechnicalExamples() {
  const examples = [
    {
      domain: "Business Strategy",
      title: "SaaS Pricing Models: When Freemium Wins vs Loses",
      author: "strategy_analyst",
      ke: 67,
      excerpt: `Why freemium works for PLG (product-led growth) companies but destroys margins for enterprise software.

Real analysis:
- Freemium adoption rates by market segment
- Conversion rates from free → paid (data from 20+ companies)
- Cost of serving free users at scale
- When to use tiered pricing instead
- Case studies: successful (Slack) and failed (Dropbox Box)

This isn't "here's the pros and cons." It's: "Here's what actually works and why."`,
      reviews: [
        {
          reviewer: "vp_product",
          comment:
            "Finally someone with data. Saved us from a freemium mistake.",
        },
      ],
    },
    {
      domain: "Psychology",
      title: "Habit Formation in Teams: Why Daily Standups Fail",
      author: "org_researcher",
      ke: 45,
      excerpt: `Standups are supposed to build accountability. Instead, they build resentment.

What the research shows:
- Habit formation requires intrinsic motivation (standups remove it)
- Public accountability increases anxiety, not performance
- Teams that thrive use async updates instead
- When synchronous is actually needed (and when it's theater)
- How to measure if your standups work or waste time

This is behavioral psychology applied to engineering teams.`,
      reviews: [
        {
          reviewer: "coach_lead",
          comment:
            "Backed by research, not opinion. Changed how we run meetings.",
        },
      ],
    },
    {
      domain: "Economics",
      title: "Why API Pricing Models Fail (And What Works Instead)",
      author: "pricing_expert",
      ke: 52,
      excerpt: `Most API companies price wrong. They optimize for revenue, not adoption.

The analysis:
- Traditional models (per-request, per-user) create adoption friction
- Why flat-rate pricing wins for startups
- When usage-based pricing actually works (hint: not often)
- Real data from Stripe, Twilio, AWS pricing patterns
- The hidden cost: complexity of metering and enforcement

Hard to implement? Yes. Worth it? Depends on your goal.`,
      reviews: [
        {
          reviewer: "finance_lead",
          comment: "This is what we needed. Justified our pricing change.",
        },
      ],
    },
    {
      domain: "Management",
      title: "The Onboarding Window: Why Month 2 Matters More Than Month 1",
      author: "people_ops",
      ke: 38,
      excerpt: `Everyone focuses on day-one onboarding. But the real risk is month 2-3.

What happens:
- Day 1: excitement and energy
- Week 2: reality hits
- Week 3: they either feel capable or lost
- Week 4: decision is made (stay or leave)

We measured:
- 40% of departures happen in month 3
- Most don't cite "bad onboarding" – they cite unclear expectations
- Setting expectations on day 3 matters more than day 1

How to fix it: structured feedback at week 2, clarity at week 3.`,
      reviews: [
        {
          reviewer: "hr_director",
          comment: "Explains why our turnover was week 3. Fixed it.",
        },
      ],
    },
    {
      domain: "Marketing",
      title:
        "Why B2B Startups Fail to Land Enterprises (Even With Great Products)",
      author: "founder_consultant",
      ke: 71,
      excerpt: `Good product + enterprise interest ≠ enterprise deals.

Three forces kill deals:
1. Economic approval (CFO isn't convinced of ROI)
2. Organizational approval (too many stakeholders)
3. Technical approval (integration burden)

Most founders address #3. They ignore #1 and #2.

Real playbook:
- How to identify who actually decides (not who claims to)
- How to build consensus across departments
- When to admit the deal isn't happening (cost vs. payoff)
- Contracts that get signed vs. deals that die

Not "tips." Actual process.`,
      reviews: [
        {
          reviewer: "ceo_peer",
          comment: "Saved us 6 months of chasing the wrong buyer.",
        },
      ],
    },
    {
      domain: "Writing",
      title:
        "Technical Communication: Why Most Engineering Docs Are Unreadable",
      author: "docs_expert",
      ke: 43,
      excerpt: `Engineers write docs like engineers: precise, comprehensive, unreadable.

The problems:
- "Comprehensive" = overwhelming
- Precision without examples = useless
- Organization by system, not by reader task

Real fix:
- Separate "how to use this" from "how it works"
- Write for the reader's first question, not all questions
- Examples before concepts
- One clear path, with advanced options separate

Examples of good vs bad technical writing.
Patterns that work.
Why they work.`,
      reviews: [
        {
          reviewer: "tech_writer",
          comment:
            "Finally someone articulated what I've been struggling to get engineers to do.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Beyond Code
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The Knowledge Equity system works for any expert field. Here's how
            non-technical contributions work.
          </p>
        </div>

        <div className="mb-12 bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            The Pattern Applies Everywhere
          </h3>
          <p className="text-muted-foreground">
            Whether you're writing about system design, business strategy,
            psychology, or anything else: Real thinking + evidence + clear
            explanation = reputation.
          </p>
        </div>

        <div className="space-y-6">
          {examples.map((example, i) => (
            <div
              key={i}
              className="border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                      {example.domain}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-primary">
                      +{example.ke}
                    </div>
                    <div className="text-xs text-muted-foreground">KE</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {example.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  By @{example.author}
                </p>
              </div>

              {/* Excerpt */}
              <div className="bg-muted/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {example.excerpt}
                </p>
              </div>

              {/* Reviews */}
              <div>
                <div className="text-sm font-semibold text-foreground mb-2">
                  Reviewer feedback:
                </div>
                {example.reviews.map((review, j) => (
                  <div key={j} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      @{review.reviewer}:
                    </span>{" "}
                    <span className="italic">"{review.comment}"</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key Points */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            What Makes Non-Technical Contributions Work
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Real Data",
                description:
                  "Not 'I think.' Show surveys, case studies, real numbers. Measurable.",
              },
              {
                title: "Clear Problem",
                description:
                  "Define the exact problem first. Then explain your thinking about solutions.",
              },
              {
                title: "Actionable",
                description:
                  "Someone reading this should be able to apply your thinking tomorrow.",
              },
              {
                title: "Honest Limits",
                description:
                  "Say what you don't know. When your thinking breaks down. Builds credibility.",
              },
              {
                title: "Not Opinion",
                description:
                  "'I think X' is weak. 'Here's why X is true based on…' is strong.",
              },
              {
                title: "Reviewable",
                description:
                  "An expert in your field should be able to evaluate it. That's your reviewer.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Domain List */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Domains Where Expertise Counts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Business Strategy",
              "Product Management",
              "Marketing & Growth",
              "HR & People Ops",
              "Finance & Economics",
              "Psychology & Behavior",
              "Sales & Enterprise",
              "Writing & Communication",
              "Design & UX",
              "Education & Learning",
              "Leadership & Coaching",
              "Legal & Compliance",
            ].map((domain) => (
              <div
                key={domain}
                className="border border-border rounded-lg p-4 hover:bg-primary/5 transition-colors"
              >
                <p className="font-medium text-foreground">{domain}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Not just tech. The system works for any knowledge domain where
            experts can validate expertise.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Ready to share your expertise?
          </h3>
          <p className="text-muted-foreground mb-6">
            You have deep knowledge in something. Explain it. Get reviewed by
            peers. Build reputation.
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
