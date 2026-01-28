import Header from "@/components/Header";
import { useParams } from "react-router-dom";
import { Award, TrendingUp, Zap, Calendar, Globe } from "lucide-react";

export default function Profile() {
  const { handle } = useParams();

  // Mock user data
  const user = {
    handle: handle || "current_user",
    bio: "Systems engineer. Distributed systems enthusiast. OSS contributor.",
    keGlobal: 2847,
    joinedAt: "2023-06-15",
    primaryDomains: ["Distributed Systems", "Backend Architecture", "Security"],
    contributions: 18,
    reviews: 42,
  };

  const domainBreakdown = [
    { domain: "Distributed Systems", ke: 1200, percentage: 42 },
    { domain: "Backend Architecture", ke: 980, percentage: 34 },
    { domain: "Security", ke: 667, percentage: 24 },
  ];

  const recentActivity = [
    { type: "contribution", title: "Consensus Mechanisms Deep Dive", ke: 45, date: "2 hours ago" },
    { type: "review", title: "Reviewed: Database Indexing Guide", ke: 12, date: "1 day ago" },
    { type: "contribution", title: "PostgreSQL Query Optimization", ke: 38, date: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="flex gap-6 items-start">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="text-2xl font-bold text-primary">
                {handle?.[0]?.toUpperCase() || "U"}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                @{user.handle}
              </h1>
              <p className="text-muted-foreground mb-4">{user.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>{user.contributions} contributions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{user.reviews} reviews</span>
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-4xl font-bold text-primary mb-1">
                {user.keGlobal}
              </div>
              <div className="text-sm font-semibold text-foreground">
                Knowledge Equity
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                            {activity.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {activity.date}
                          </span>
                        </div>
                        <p className="text-foreground font-medium">{activity.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-primary">
                          +{activity.ke}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Expertise */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Expertise</h2>
              <div className="space-y-3">
                {user.primaryDomains.map((domain) => (
                  <div key={domain} className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium">{domain}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* KE Breakdown */}
            <section className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                KE by Domain
              </h3>
              <div className="space-y-3">
                {domainBreakdown.map((item) => (
                  <div key={item.domain}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.domain}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {item.ke}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {user.contributions}
                  </div>
                  <div className="text-sm text-muted-foreground">Contributions</div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="text-2xl font-bold text-primary">
                    {user.reviews}
                  </div>
                  <div className="text-sm text-muted-foreground">Reviews Given</div>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="text-2xl font-bold text-primary">
                    {(user.keGlobal / 500).toFixed(1)}x
                  </div>
                  <div className="text-sm text-muted-foreground">Average Impact</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
