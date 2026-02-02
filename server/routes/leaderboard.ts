import { RequestHandler } from "express";
import { supabasePublic } from "../lib/supabaseServer";

function badgeForRank(rank: number) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "⭐";
}

// GET /api/leaderboard?domain=<domainName>
export const handleLeaderboard: RequestHandler = async (req, res) => {
  try {
    const domain =
      typeof req.query.domain === "string" ? req.query.domain : undefined;

    // Fetch user KE rows (per domain or all)
    const keQuery = supabasePublic
      .from("user_ke")
      .select(
        "user_id, domain, ke_amount, contributions_count, reviews_given_count, users!user_ke_user_id_fkey(handle)",
      );

    const { data: keRows, error: keErr } = domain
      ? await keQuery.eq("domain", domain)
      : await keQuery;

    if (keErr) {
      console.error("Fetch leaderboard user_ke error:", keErr);
      return res.status(500).json({ error: keErr.message });
    }

    // Aggregate global across domains if domain not specified
    type Agg = {
      user_id: string;
      handle: string;
      ke: number;
      domains: Set<string>;
      contributions: number;
      reviews: number;
    };

    const byUser = new Map<string, Agg>();

    for (const row of keRows || []) {
      const user_id = (row as any).user_id as string;
      const handle = (row as any).users?.handle as string | undefined;
      if (!user_id || !handle) continue;

      const ke = Number((row as any).ke_amount ?? 0);
      const d = (row as any).domain as string;
      const contributions = Number((row as any).contributions_count ?? 0);
      const reviews = Number((row as any).reviews_given_count ?? 0);

      const agg = byUser.get(user_id) ?? {
        user_id,
        handle,
        ke: 0,
        domains: new Set<string>(),
        contributions: 0,
        reviews: 0,
      };

      agg.ke += ke;
      agg.domains.add(d);
      agg.contributions += contributions;
      agg.reviews += reviews;
      byUser.set(user_id, agg);
    }

    const leaders = Array.from(byUser.values())
      .sort((a, b) => b.ke - a.ke)
      .slice(0, 100)
      .map((u, idx) => ({
        rank: idx + 1,
        badge: badgeForRank(idx + 1),
        handle: u.handle,
        ke: Math.round(u.ke),
        contributions: u.contributions,
        reviews: u.reviews,
        domains: Array.from(u.domains),
      }));

    res.setHeader("Cache-Control", "public, max-age=30");
    return res.json({ leaders, domain, total: leaders.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};
