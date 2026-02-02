import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Globe,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DomainWithStats = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  stats: {
    domain: string;
    total_contributions: number;
    total_contributors: number;
    total_ke: number;
  };
};

export default function Domains() {
  const [searchTerm, setSearchTerm] = useState("");
  const [domains, setDomains] = useState<DomainWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch("/api/domains?stats=1")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setDomains((data.domains as DomainWithStats[]) || []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError("Failed to load domains");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filteredDomains = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return domains;
    return domains.filter((d) => {
      return (
        d.name.toLowerCase().includes(term) ||
        (d.description || "").toLowerCase().includes(term)
      );
    });
  }, [domains, searchTerm]);

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 lg:pb-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-10 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                Domain Atlas
              </div>
              <h1 className="text-4xl font-semibold text-foreground mt-3 flex items-center gap-3">
                <Globe className="w-8 h-8 text-primary" />
                Knowledge Domains
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore high-signal areas and the communities shaping them.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3">
              <div className="text-xs text-muted-foreground">
                Domains indexed
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {domains.length}
              </div>
            </div>
          </div>

          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-border rounded-2xl bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </section>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading domains…</div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load domains</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && filteredDomains.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No domains found. (Have you run the Supabase migrations and added
            domains?)
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDomains.map((domain) => (
            <div
              key={domain.id}
              className="glass-panel rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {domain.name}
                  </h3>
                  {domain.description && (
                    <p className="text-muted-foreground text-sm mt-2">
                      {domain.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <FileText className="w-3 h-3" />
                    <span>Contributions</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {domain.stats.total_contributions}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Users className="w-3 h-3" />
                    <span>Contributors</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {domain.stats.total_contributors}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Total KE</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {domain.stats.total_ke}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
