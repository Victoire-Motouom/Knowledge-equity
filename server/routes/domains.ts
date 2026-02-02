import { RequestHandler } from "express";
import { supabasePublic } from "../lib/supabaseServer";

// GET /api/domains
// Returns list of domains + basic stats derived from contributions/user_ke.
export const handleDomains: RequestHandler = async (_req, res) => {
  try {
    const statsEnabled = _req.query.stats === "1";
    const { data: domains, error } = await supabasePublic
      .from("domains")
      .select("id, name, description, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Fetch domains error:", error);
      return res.status(500).json({ error: error.message });
    }

    const { data: contributionDomains, error: contributionErr } =
      await supabasePublic
        .from("contributions")
        .select("domain, created_at")
        .order("created_at", { ascending: false })
        .limit(statsEnabled ? 2000 : 400);

    if (contributionErr) {
      console.error("Fetch contribution domains error:", contributionErr);
      return res.status(500).json({ error: contributionErr.message });
    }

    const domainMap = new Map<string, any>();
    for (const d of domains || []) {
      if (!d?.name) continue;
      domainMap.set(d.name, d);
    }
    for (const row of contributionDomains || []) {
      const name = (row as any).domain as string | null;
      if (!name) continue;
      if (!domainMap.has(name)) {
        domainMap.set(name, {
          id: `contrib:${name}`,
          name,
          description: null,
          created_at: null,
        });
      }
    }

    const mergedDomains = Array.from(domainMap.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name)),
    );

    if (!statsEnabled) {
      res.setHeader("Cache-Control", "public, max-age=60");
      return res.json({ domains: mergedDomains });
    }

    // Stats: total_contributions per domain
    const { data: contributions, error: contribErr } = await supabasePublic
      .from("contributions")
      .select("domain, author");

    if (contribErr) {
      console.error("Fetch contributions error:", contribErr);
      return res.status(500).json({ error: contribErr.message });
    }

    const contribByDomain = new Map<
      string,
      { count: number; authors: Set<string> }
    >();
    for (const c of contributions || []) {
      const domain = (c as any).domain as string | null;
      if (!domain) continue;
      const author = (c as any).author as string | null;
      const entry = contribByDomain.get(domain) ?? {
        count: 0,
        authors: new Set(),
      };
      entry.count += 1;
      if (author) entry.authors.add(author);
      contribByDomain.set(domain, entry);
    }

    // Stats: total_ke per domain from user_ke
    const { data: keRows, error: keErr } = await supabasePublic
      .from("user_ke")
      .select("domain, ke_amount");

    if (keErr) {
      console.error("Fetch user_ke error:", keErr);
      return res.status(500).json({ error: keErr.message });
    }

    const keByDomain = new Map<string, number>();
    for (const row of keRows || []) {
      const domain = (row as any).domain as string;
      const ke = Number((row as any).ke_amount ?? 0);
      keByDomain.set(domain, (keByDomain.get(domain) ?? 0) + ke);
    }

    const withStats = mergedDomains.map((d: any) => {
      const contrib = contribByDomain.get(d.name);
      return {
        ...d,
        stats: {
          domain: d.name,
          total_contributions: contrib?.count ?? 0,
          total_contributors: contrib?.authors.size ?? 0,
          total_ke: keByDomain.get(d.name) ?? 0,
        },
      };
    });

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.json({ domains: withStats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};
