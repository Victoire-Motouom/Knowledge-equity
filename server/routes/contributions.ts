import { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabaseServer";
import { ContributionCreateSchema } from "../lib/validation";
import { validateWikidataDomain } from "../lib/wikidata";
import {
  sanitizeDomain,
  sanitizeMarkdown,
  sanitizeText,
} from "../lib/sanitize";

async function ensureUserRow(authUser: any) {
  const authUserId = authUser.id as string;
  const email = (authUser.email as string | null) ?? null;

  // Prefer by id
  const { data: byId } = await supabaseAdmin
    .from("users")
    .select("id, handle, email, created_at")
    .eq("id", authUserId)
    .maybeSingle();

  if (byId) return byId;

  // Fallback by email (legacy)
  if (email) {
    const { data: byEmail } = await supabaseAdmin
      .from("users")
      .select("id, handle, email, created_at")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) return byEmail;
  }

  // Create
  const baseFromEmail = email ? email.split("@")[0] : null;
  const baseFromMeta =
    (authUser.user_metadata as any)?.handle ||
    (authUser.user_metadata as any)?.username ||
    null;

  const baseHandleRaw = (baseFromMeta || baseFromEmail || "user").toString();
  const baseHandle = baseHandleRaw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  const suffixSeed = authUserId.replace(/-/g, "").slice(-6);
  let candidate = baseHandle || `user_${suffixSeed}`;

  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("handle", candidate)
      .maybeSingle();

    if (!existing) break;
    candidate = `${(baseHandle || "user").slice(0, 18)}_${suffixSeed}${i || ""}`;
  }

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("users")
    .insert({ id: authUserId, handle: candidate, email })
    .select("id, handle, email, created_at")
    .single();

  if (insertErr || !inserted) {
    throw new Error(insertErr?.message || "Failed to create users row");
  }

  return inserted;
}

export const handleContributions: RequestHandler = async (_req, res) => {
  try {
    const page = Math.max(1, Number(_req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(_req.query.limit) || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Basic select; expects a `contributions` table in Supabase
    const { data, error } = await supabasePublic
      .from("contributions")
      .select(
        `id, title, excerpt, domain, author, ke_gained, reviews_count, created_at, users!contributions_author_fkey(handle)`,
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Normalize to the client shape used in Feed.tsx
    const contributions = (data || []).map((c: any) => {
      const cid = Number(c.id);
      return {
        id: c.id,
        title: c.title,
        author: c.users?.handle || "unknown",
        author_id: c.author ?? undefined,
        domain: c.domain,
        type: c.type || "research",
        excerpt: c.excerpt || "",
        reviews: c.reviews_count || 0,
        keGained: c.ke_gained || 0,
        createdAt: c.created_at,
      };
    });

    res.setHeader("Cache-Control", "public, max-age=30");
    res.json({ contributions, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
};

export const handleMyContributions: RequestHandler = async (req, res) => {
  try {
    const authUser = req.auth?.user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const status =
      typeof req.query.status === "string" ? req.query.status : "all";

    if (status !== "all" && status !== "published") {
      return res.status(400).json({ error: "Invalid status filter" });
    }

    const { data, error } = await supabaseAdmin
      .from("contributions")
      .select(
        "id, title, excerpt, domain, author, ke_gained, reviews_count, created_at, users!contributions_author_fkey(handle)",
      )
      .eq("author", authUser.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Supabase fetch my contributions error:", error);
      return res.status(500).json({ error: error.message });
    }

    const contributions = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      author: c.users?.handle || "unknown",
      author_id: c.author ?? undefined,
      domain: c.domain,
      type: c.type || "research",
      excerpt: c.excerpt || "",
      reviews: c.reviews_count || 0,
      keGained: c.ke_gained || 0,
      createdAt: c.created_at,
    }));

    return res.json({ contributions, status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

export const handleCreateContribution: RequestHandler = async (req, res) => {
  try {
    // `requireAuth` middleware guarantees req.auth.
    const authUser = req.auth?.user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ensure app-level user row exists so contributions.author (FK) is valid.
    let appUser: any;
    try {
      appUser = await ensureUserRow(authUser);
    } catch (e: any) {
      console.error("ensureUserRow error", e);
      return res
        .status(500)
        .json({ error: e?.message || "Failed to ensure user" });
    }

    const parsed = ContributionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const {
      title,
      excerpt,
      content,
      domain,
      type,
      effort,
      effortUnit,
      external,
    } = parsed.data;

    const sanitizedTitle = sanitizeText(title);
    const sanitizedDomain = sanitizeDomain(domain);
    const sanitizedContent = sanitizeMarkdown(content);
    const sanitizedExcerpt = excerpt ? sanitizeMarkdown(excerpt) : undefined;

    const domainValidation = await validateWikidataDomain(sanitizedDomain);
    const normalizedDomain =
      domainValidation.exact?.label || sanitizedDomain.trim();

    const insertPayload: any = {
      title: sanitizedTitle,
      excerpt: sanitizedExcerpt ?? sanitizedContent.slice(0, 300),
      content: sanitizedContent,
      domain: normalizedDomain,
      type,
      effort: effort ?? null,
      effort_unit: effortUnit ?? null,
      external_link: external ?? null,
      author: appUser.id,
    };

    const { data, error } = await supabaseAdmin
      .from("contributions")
      .insert([insertPayload])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!error) {
      await supabaseAdmin
        .from("domains")
        .upsert({ name: normalizedDomain }, { onConflict: "name" });
    }

    res.status(201).json({ contribution: data?.[0] ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
};
