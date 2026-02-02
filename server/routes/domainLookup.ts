import type { RequestHandler } from "express";
import { searchWikidataDomains, validateWikidataDomain } from "../lib/wikidata";

// GET /api/domains/search?q=react
export const handleDomainSearch: RequestHandler = async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) return res.json({ query: q, results: [] });

    const results = await searchWikidataDomains(q, 8);
    return res.json({ query: q, results });
  } catch (err: any) {
    console.error("Wikidata search error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "domain_lookup_failed" });
  }
};

// GET /api/domains/validate?name=React
export const handleDomainValidate: RequestHandler = async (req, res) => {
  try {
    const name =
      typeof req.query.name === "string" ? req.query.name.trim() : "";
    if (!name) {
      return res.status(400).json({ error: "Missing name" });
    }

    const validation = await validateWikidataDomain(name);
    return res.json({
      name,
      valid: validation.valid,
      exact: validation.exact,
      matches: validation.matches,
    });
  } catch (err: any) {
    console.error("Wikidata validation error:", err);
    return res
      .status(500)
      .json({ error: err?.message || "domain_validation_failed" });
  }
};
