import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Autocomplete from "@/components/ui/autocomplete";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { UserProfile } from "@shared/api";
import { useEffect, useMemo, useState } from "react";

function normalizeHandle(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export default function ProfileMe() {
  const VERIFIED_DOMAIN_KE = 100;
  const { accessToken, loading: authLoading } = useSupabaseAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User settings
  const [handle, setHandle] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");

  // Realm settings (expertise)
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseDraft, setExpertiseDraft] = useState("");
  const [expertiseResults, setExpertiseResults] = useState<
    { id: string; label: string; description?: string }[]
  >([]);
  const [expertiseLoading, setExpertiseLoading] = useState(false);
  const [expertiseError, setExpertiseError] = useState<string | null>(null);

  const [savingUser, setSavingUser] = useState(false);
  const [savingRealm, setSavingRealm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setError("You must be signed in to manage settings.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch("/api/profile/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (r) => {
        const json = await r.json().catch(() => null);
        if (!r.ok) {
          const message =
            (json as any)?.error || `Request failed (${r.status})`;
          throw new Error(message);
        }
        return json as UserProfile;
      })
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
        setHandle(p.handle || "");
        setWebsite(p.website || "");
        setTwitter(p.twitter || "");
        setGithub(p.github || "");
        setExpertise(p.expertise || []);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError(e?.message || "Failed to load settings");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [accessToken, authLoading]);

  const expertiseMatchesExact = useMemo(() => {
    const normalized = expertiseDraft.trim().toLowerCase();
    return expertiseResults.some(
      (item) => item.label.toLowerCase() === normalized,
    );
  }, [expertiseDraft, expertiseResults]);

  const verifiedDomains = useMemo(() => {
    return new Set(
      (profile?.domain_breakdown || [])
        .filter((d) => d.ke >= VERIFIED_DOMAIN_KE)
        .map((d) => d.domain.toLowerCase()),
    );
  }, [profile]);

  const addExpertise = (domainRaw: string) => {
    const domain = domainRaw.trim();
    if (!domain) return;
    const matchesExact = expertiseResults.some(
      (item) => item.label.toLowerCase() === domain.toLowerCase(),
    );
    if (!matchesExact) {
      toast({
        title: "Domain not found",
        description: "Select an exact short single-word match from Wikidata.",
        variant: "destructive",
      });
      return;
    }
    if (expertise.some((d) => d.toLowerCase() === domain.toLowerCase())) return;
    setExpertise((prev) => [...prev, domain].slice(0, 50));
    setExpertiseDraft("");
  };

  useEffect(() => {
    const q = expertiseDraft.trim();
    if (!q) {
      setExpertiseResults([]);
      setExpertiseError(null);
      return;
    }

    const controller = new AbortController();
    setExpertiseLoading(true);
    setExpertiseError(null);

    fetch(`/api/domains/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data?.results)) {
          setExpertiseResults([]);
          return;
        }
        setExpertiseResults(data.results);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error(err);
        setExpertiseError("Failed to fetch domain suggestions");
      })
      .finally(() => {
        setExpertiseLoading(false);
      });

    return () => controller.abort();
  }, [expertiseDraft]);

  const removeExpertise = (domain: string) => {
    setExpertise((prev) => prev.filter((d) => d !== domain));
  };

  const saveUserSettings = async () => {
    if (!accessToken) return;
    setSavingUser(true);
    try {
      const payload = {
        handle: normalizeHandle(handle),
        website: website.trim(),
        twitter: twitter.trim(),
        github: github.trim(),
      };

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (json as any)?.error || (json as any)?.details || "Update failed",
        );
      }

      setProfile(json as UserProfile);
      toast({
        title: "Saved",
        description: "Your user settings were updated.",
      });
    } catch (e: any) {
      toast({
        title: "Couldn’t save",
        description: e?.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setSavingUser(false);
    }
  };

  const saveRealmSettings = async () => {
    if (!accessToken) return;
    setSavingRealm(true);
    try {
      const payload = { expertise };

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (json as any)?.error || (json as any)?.details || "Update failed",
        );
      }

      setProfile(json as UserProfile);
      toast({
        title: "Saved",
        description: "Your realm settings were updated.",
      });
    } catch (e: any) {
      toast({
        title: "Couldn’t save",
        description: e?.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setSavingRealm(false);
    }
  };

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-24 lg:pb-12">
        <section className="glass-panel rounded-3xl p-6 sm:p-8 mb-8">
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile identity and realm expertise.
          </p>
        </section>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading settings…</div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Couldn’t load settings</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && profile && (
          <div className="space-y-6">
            <Card className="glass-panel border-border">
              <CardHeader>
                <CardTitle>User settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Handle</div>
                    <Input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="your_handle"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Letters, numbers, underscore. Max 24.
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Website</div>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Twitter</div>
                    <Input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@handle"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">GitHub</div>
                    <Input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="username or URL"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button onClick={saveUserSettings} disabled={savingUser}>
                    {savingUser ? "Saving…" : "Save user settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border">
              <CardHeader>
                <CardTitle>Realm settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">
                    Expertise domains
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Autocomplete
                        suggestions={expertiseResults.map((d) => d.label)}
                        value={expertiseDraft}
                        placeholder="Add a domain (e.g. Distributed Systems)"
                        onChange={(v) => setExpertiseDraft(v)}
                        onSelect={(v) => addExpertise(v)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addExpertise(expertiseDraft)}
                    >
                      Add
                    </Button>
                  </div>

                  {expertise.length === 0 ? (
                    <div className="text-sm text-muted-foreground mt-3">
                      No expertise domains selected.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {expertise.map((d) => (
                        <Badge
                          key={d}
                          variant="secondary"
                          className="cursor-pointer inline-flex items-center gap-2"
                          onClick={() => removeExpertise(d)}
                          title="Click to remove"
                        >
                          {d}
                          {verifiedDomains.has(d.toLowerCase()) && (
                            <span className="text-[10px] uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {expertiseLoading && "Searching Wikidata…"}
                    {!expertiseLoading && expertiseError && expertiseError}
                    {!expertiseLoading &&
                      !expertiseError &&
                      expertiseDraft.trim().length > 1 &&
                      !expertiseMatchesExact && (
                        <span>No exact match found. Select a suggestion.</span>
                      )}
                    {!expertiseLoading &&
                      !expertiseError &&
                      expertiseMatchesExact && (
                        <span>Exact domain match confirmed.</span>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button onClick={saveRealmSettings} disabled={savingRealm}>
                    {savingRealm ? "Saving…" : "Save realm settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
