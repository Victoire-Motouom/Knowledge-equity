import Header from "@/components/Header";
import { Globe, Users, FileText, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Domains() {
  const [searchTerm, setSearchTerm] = useState("");

  const domains = [
    {
      id: "distributed-systems",
      name: "Distributed Systems",
      description: "Consensus algorithms, scalability, fault tolerance, and distributed consensus",
      icon: "🔄",
      contributions: 156,
      experts: 24,
      keGenerated: 8240,
      trending: true,
    },
    {
      id: "react",
      name: "React",
      description: "Frontend library, hooks, performance optimization, and component patterns",
      icon: "⚛️",
      contributions: 142,
      experts: 19,
      keGenerated: 7120,
      trending: true,
    },
    {
      id: "backend-architecture",
      name: "Backend Architecture",
      description: "System design, database patterns, API design, and microservices",
      icon: "🏗️",
      contributions: 128,
      experts: 22,
      keGenerated: 6850,
      trending: false,
    },
    {
      id: "security",
      name: "Security",
      description: "Cryptography, authentication, authorization, and vulnerability analysis",
      icon: "🔒",
      contributions: 94,
      experts: 18,
      keGenerated: 5620,
      trending: true,
    },
    {
      id: "devops",
      name: "DevOps",
      description: "Infrastructure, deployment, monitoring, and operational excellence",
      icon: "🚀",
      contributions: 87,
      experts: 15,
      keGenerated: 4950,
      trending: false,
    },
    {
      id: "databases",
      name: "Databases",
      description: "SQL, NoSQL, indexing, query optimization, and data modeling",
      icon: "🗄️",
      contributions: 112,
      experts: 20,
      keGenerated: 6320,
      trending: true,
    },
    {
      id: "machine-learning",
      name: "Machine Learning",
      description: "Algorithms, training, inference, and model optimization",
      icon: "🤖",
      contributions: 73,
      experts: 12,
      keGenerated: 4100,
      trending: true,
    },
    {
      id: "web-performance",
      name: "Web Performance",
      description: "Optimization, metrics, rendering, and user experience",
      icon: "⚡",
      contributions: 68,
      experts: 11,
      keGenerated: 3840,
      trending: false,
    },
    {
      id: "typescript",
      name: "TypeScript",
      description: "Type system, advanced patterns, and tooling ecosystem",
      icon: "📘",
      contributions: 82,
      experts: 14,
      keGenerated: 4620,
      trending: false,
    },
    {
      id: "testing",
      name: "Testing",
      description: "Unit tests, integration tests, E2E testing, and test strategies",
      icon: "✅",
      contributions: 65,
      experts: 10,
      keGenerated: 3680,
      trending: false,
    },
  ];

  const filteredDomains = domains.filter(
    (domain) =>
      domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            Knowledge Domains
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore focused areas of expertise in our knowledge commons
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        {/* Trending Badge */}
        {filteredDomains.some((d) => d.trending) && (
          <div className="mb-6">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              🔥 Trending domains have recent high-quality activity
            </span>
          </div>
        )}

        {/* Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDomains.map((domain) => (
            <div
              key={domain.id}
              className={`border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group ${
                domain.trending ? "border-accent/50 bg-accent/5" : "border-border"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{domain.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {domain.name}
                    </h3>
                    {domain.trending && (
                      <span className="text-xs font-semibold text-accent">
                        🔥 Trending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-4">
                {domain.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <FileText className="w-3 h-3" />
                    <span>Contributions</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {domain.contributions}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Users className="w-3 h-3" />
                    <span>Experts</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {domain.experts}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>KE Generated</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {(domain.keGenerated / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Explore Domain
              </button>
            </div>
          ))}
        </div>

        {filteredDomains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No domains match your search. Try different keywords.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
