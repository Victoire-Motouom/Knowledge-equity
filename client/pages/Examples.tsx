import Header from "@/components/Header";
import { CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Examples() {
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const examples = [
    {
      id: "bug-good",
      type: "Bug Analysis",
      title: "Good Example",
      status: "✓ Published, gained +42 KE",
      contribution: {
        title: "Race condition in async task scheduler",
        domain: "Backend",
        content: `# Race Condition in Node.js Task Scheduler

## The Problem
Our Node.js service was crashing intermittently with "Maximum call stack exceeded" after running for 12+ hours under high load. The crash happened randomly, making it hard to reproduce.

## Root Cause Investigation
I traced the issue through:
1. Added detailed logging to task execution
2. Found that when a task errors, its retry handler was queuing itself indefinitely
3. Under high load, the retry queue itself was being retried
4. This created a cascading recursive queue – each error spawned more errors

The bug only manifested under sustained load because the memory pressure was needed to trigger the cascade.

## The Fix
Instead of allowing failed task handlers to re-queue themselves, we now:
- Cap retries at 3 attempts
- Use exponential backoff (1s, 5s, 30s)
- Reject the entire task after max retries instead of re-queueing

## Why This Matters
Task queues are common in Node applications. This pattern applies to job queues, message handlers, and async processors. Understanding the edge case helps others avoid it.

## Link to Fix
https://github.com/project/pull/2847 (merged)`,
        reviews: [
          {
            reviewer: "sam_coder",
            rating: "Confirmed correct",
            comment:
              "Clear investigation. The exponential backoff solution is standard practice.",
          },
          {
            reviewer: "backend_expert",
            rating: "Valuable insight",
            comment:
              "Good catch on the cascade pattern. Applies to many queue systems.",
          },
        ],
        ke: 42,
      },
      whyGood: [
        "✓ Shows the investigation process (not just 'found a bug')",
        "✓ Explains root cause clearly with details",
        "✓ Why it matters to others (generalized lesson)",
        "✓ Links to real code as proof",
        "✓ Specific technical details (exponential backoff, retry limits)",
      ],
    },
    {
      id: "bug-bad",
      type: "Bug Analysis",
      title: "Bad Example",
      status: "✗ Rejected, 0 KE",
      contribution: {
        title: "Fixed a bug",
        domain: "Backend",
        content: `Fixed a race condition in task handling. 

Check the PR: https://github.com/project/pull/2847

Works better now.`,
        reviews: [
          {
            reviewer: "reviewer1",
            rating: "Request changes",
            comment:
              "What was the bug? Why did it happen? Why does your fix work? I have no idea what to evaluate.",
          },
        ],
        ke: 0,
      },
      whyBad: [
        "✗ No explanation – just a PR link",
        "✗ Doesn't explain what the bug was",
        "✗ No root cause analysis",
        "✗ Doesn't say why it matters",
        "✗ Reviewer can't assess without reading code (not their job)",
      ],
    },
    {
      id: "research-good",
      type: "Research Note",
      title: "Good Example",
      status: "✓ Published, gained +58 KE",
      contribution: {
        title: "Raft vs PBFT: When to Use Which Consensus Algorithm",
        domain: "Distributed Systems",
        content: `# Consensus Algorithms: A Practical Comparison

## The Question
You're building a distributed system that needs consensus. Raft and PBFT are both proven algorithms. Which do you actually use?

## The Answer (Context Matters)
Raft wins for most systems. PBFT wins when you need to tolerate malicious actors.

## Raft (the standard choice)
- Assumes honest participants
- Complexity: moderate (easier to implement)
- Message overhead: log(N) per decision
- Used in: etcd, Consul, many databases

When to use:
- Internal systems (not exposed to untrusted input)
- When liveness > byzantine tolerance
- Teams without PhD-level distributed systems knowledge

## PBFT (Byzantine Fault Tolerant)
- Assumes some nodes can be corrupted/malicious
- Complexity: very high (3 rounds of voting)
- Message overhead: O(N²) – becomes expensive at scale
- Used in: blockchain (modified PBFT), permissioned networks

When to use:
- Public/permissionless networks
- Adversarial environments
- When one bad actor can't stop consensus

## Cost Analysis
A 100-node Raft cluster: ~1000 messages per decision
A 100-node PBFT cluster: ~10,000 messages per decision

At internet scale, PBFT becomes impractical.

## Conclusion
Most engineers should reach for Raft first. PBFT is not "better" – it's for different problems.`,
        reviews: [
          {
            reviewer: "distributed_sys_expert",
            rating: "Novel insight",
            comment:
              "Good framing of the tradeoff. Most people don't think about the O(N²) cost until it's too late.",
          },
          {
            reviewer: "research_lead",
            rating: "Confirmed correct",
            comment: "Accurate. The cost analysis is particularly useful.",
          },
        ],
        ke: 58,
      },
      whyGood: [
        "✓ Answers a real decision question",
        "✓ Explains each option clearly",
        "✓ Includes tradeoffs (complexity, cost, assumptions)",
        "✓ Specific guidance (when to use each)",
        "✓ Quantitative comparison (message overhead)",
        "✓ Helps others make decisions, not just learn facts",
      ],
    },
    {
      id: "research-bad",
      type: "Research Note",
      title: "Bad Example",
      status: "✗ Rejected, 0 KE",
      contribution: {
        title: "About Consensus Algorithms",
        domain: "Distributed Systems",
        content: `Raft and PBFT are both consensus algorithms.

Raft is simpler. PBFT is more secure.

Both are used in distributed systems.

Here's a Wikipedia article about it: https://en.wikipedia.org/wiki/Consensus_(computer_science)

Hope this helps!`,
        reviews: [
          {
            reviewer: "reviewer1",
            rating: "Request changes",
            comment:
              "This is just a summary of what's already on Wikipedia. Where's your thinking? What did you learn? Why should I read this instead of Wikipedia?",
          },
        ],
        ke: 0,
      },
      whyBad: [
        "✗ Just summarizes public information",
        "✗ No original analysis or thinking",
        "✗ No decision guidance",
        "✗ Vague claims without evidence ('more secure')",
        "✗ Doesn't help someone actually choose an algorithm",
      ],
    },
    {
      id: "debate-good",
      type: "Structured Argument",
      title: "Good Example",
      status: "✓ Published, gained +38 KE",
      contribution: {
        title: "Why Monoliths Still Win (And When Microservices Fail)",
        domain: "Architecture",
        content: `# The Monolith Question

## The Claim
For most companies, a well-structured monolith beats microservices on speed, reliability, and total cost of ownership.

## Why People Disagree
"Microservices = scalability + independence." Everyone wants that. It sounds good.

But the math doesn't work for 95% of teams.

## Evidence: The Cost of Microservices

### Operational Costs
- Monitoring: 10 services = complex distributed tracing
- Deployment: Rolling updates across services (harder)
- Testing: Integration tests now cross the network
- Debugging: A slow query appears in 3 systems

Cost: 2-3x the engineering time of a monolith

### When You Actually Need It
Microservices only win when:
1. You have >100 engineers (coordination costs exceed split costs)
2. You have genuinely independent services (Netflix: streaming + billing)
3. You need independent scaling (Instagram: photo storage ≠ timeline feed)

### The Cost Reality
AWS case study: A startup with 10 engineers ran 40 microservices.
- Deployment complexity cost: $200k/year in engineering time
- Actual scalability benefit: none (wasn't hitting limits)
- Monolith would have cost: $50k

## What Monolith Wins On
- Time to market (one deploy pipeline)
- Debuggability (stack traces go end-to-end)
- Testing (no network mocks needed)
- Cost (one database, one cache, one auth system)

## When I'd Be Wrong
- If network latency becomes your bottleneck (measure it first)
- If service-level scaling is real (not theoretical)
- If you hit coordination costs (>8 person teams per service)

## Conclusion
Start monolith. Split when pain is real, not theoretical.`,
        reviews: [
          {
            reviewer: "backend_architect",
            rating: "Valuable but incomplete",
            comment:
              "Good practical cost analysis. Missing: migration path if you do need to split later. Still solid.",
          },
          {
            reviewer: "tech_lead",
            rating: "Confirmed correct",
            comment:
              "This matches our experience. Started monolith, still monolith at $10M revenue.",
          },
        ],
        ke: 38,
      },
      whyGood: [
        "✓ Makes a clear claim with nuance",
        "✓ Acknowledges opposing view fairly",
        "✓ Provides quantitative evidence (costs, timeframes)",
        "✓ Specific conditions (>100 engineers, independent scaling)",
        "✓ Honest about when the author is wrong",
        "✓ Helps readers make actual decisions, not just debate",
      ],
    },
    {
      id: "debate-bad",
      type: "Structured Argument",
      title: "Bad Example",
      status: "✗ Rejected, 0 KE",
      contribution: {
        title: "Microservices Are Overrated",
        domain: "Architecture",
        content: `Everyone is obsessed with microservices but they're a hype thing. Monoliths are better.

Most companies use microservices wrong. It's just fashion.

People don't understand the real costs.

I've worked at 3 companies and every time microservices created problems.

The tech industry is broken.`,
        reviews: [
          {
            reviewer: "reviewer1",
            rating: "Request changes",
            comment:
              "This is opinion. Where's evidence? You claim 'wrong' usage – what does 'right' look like? 'Hype' isn't an argument. Rewrite with specifics.",
          },
        ],
        ke: 0,
      },
      whyBad: [
        "✗ Pure opinion, no evidence",
        "✗ Sweeping generalizations ('everyone')",
        "✗ Doesn't define the problem clearly",
        "✗ Personal anecdote without context",
        "✗ Doesn't help anyone make decisions",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Good vs Bad Contributions
          </h1>
          <p className="text-lg text-muted-foreground">
            Real examples of what gets published and what gets rejected. See
            why.
          </p>
        </div>

        <div className="space-y-6">
          {examples.map((example) => (
            <div
              key={example.id}
              className="border border-border rounded-xl overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedExample(
                    expandedExample === example.id ? null : example.id,
                  )
                }
                className="w-full px-6 py-4 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-3 rounded-lg flex-shrink-0 ${
                      example.title === "Good Example"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {example.title === "Good Example" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {example.type}: {example.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {example.status}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                    expandedExample === example.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Content */}
              {expandedExample === example.id && (
                <div className="p-6 space-y-6 border-t border-border">
                  {/* Contribution Preview */}
                  <div className="bg-muted/20 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-2">
                      {example.contribution.title}
                    </h4>
                    <div className="flex gap-2 mb-4">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {example.contribution.domain}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                      {example.contribution.content}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                      ...{Math.ceil(example.contribution.content.length / 20)}{" "}
                      word excerpt
                    </div>
                  </div>

                  {/* Reviews */}
                  {example.contribution.reviews.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Reviews ({example.contribution.reviews.length})
                      </h4>
                      <div className="space-y-3">
                        {example.contribution.reviews.map((review, i) => (
                          <div
                            key={i}
                            className="border border-border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-foreground">
                                @{review.reviewer}
                              </div>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {review.rating}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              "{review.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis */}
                  <div>
                    <h4
                      className={`font-semibold mb-3 flex items-center gap-2 ${
                        example.title === "Good Example"
                          ? "text-green-600"
                          : "text-destructive"
                      }`}
                    >
                      {example.title === "Good Example" ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Why This Works
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Why This Fails
                        </>
                      )}
                    </h4>
                    <ul className="space-y-2">
                      {(example.title === "Good Example"
                        ? example.whyGood
                        : example.whyBad
                      ).map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Takeaway */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            The Pattern
          </h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">
                Good contributions:
              </span>{" "}
              Show your thinking. Explain why it matters. Give readers something
              they didn't know. Help them make decisions.
            </p>
            <p>
              <span className="font-semibold text-foreground">
                Bad contributions:
              </span>{" "}
              Just post a link. Summarize public info. Make claims without
              evidence. Tell, don't show.
            </p>
            <p className="pt-3 text-sm">
              The system rewards explanation and thinking, not just doing work.
              Anyone can fix a bug. But explaining why the bug happened and why
              your fix works? That's what builds reputation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
