import { RequestHandler } from "express";
import { supabasePublic } from "../lib/supabaseServer";

// GET /api/contributions/:id
export const handleContributionDetail: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const { data: contribution, error } = await supabasePublic
      .from("contributions")
      .select(
        `id, title, excerpt, content, domain, type, author, reviews_count, ke_gained, effort, effort_unit, external_link, views, created_at, updated_at, users!contributions_author_fkey(handle)`,
      )
      .eq("id", id)
      .single();

    if (error || !contribution) {
      return res.status(404).json({ error: "Contribution not found" });
    }

    // Fetch reviews via existing endpoint logic
    const { data: reviews, error: reviewsErr } = await supabasePublic
      .from("reviews")
      .select(
        `id, contribution_id, reviewer, rating, confidence, comment, ke_awarded, created_at, users!reviews_reviewer_fkey(handle)`,
      )
      .eq("contribution_id", id)
      .order("created_at", { ascending: false });

    if (reviewsErr) {
      console.error("Fetch reviews error:", reviewsErr);
      return res.status(500).json({ error: reviewsErr.message });
    }

    const formattedReviews = (reviews || []).map((r: any) => ({
      id: r.id,
      contribution_id: r.contribution_id,
      reviewer: r.users?.handle || "unknown",
      reviewer_id: r.reviewer,
      rating: r.rating,
      confidence: r.confidence,
      comment: r.comment,
      ke_awarded: r.ke_awarded,
      created_at: r.created_at,
    }));

    const avgConfidence =
      formattedReviews.length > 0
        ? formattedReviews.reduce(
            (s: number, r: any) => s + (r.confidence || 0),
            0,
          ) / formattedReviews.length
        : 0;

    return res.json({
      id: (contribution as any).id,
      title: (contribution as any).title,
      excerpt: (contribution as any).excerpt ?? "",
      content: (contribution as any).content ?? "",
      domain: (contribution as any).domain,
      type: (contribution as any).type,
      author: (contribution as any).users?.handle || "unknown",
      author_id: (contribution as any).author ?? undefined,
      reviews_count:
        (contribution as any).reviews_count ?? formattedReviews.length,
      ke_gained: (contribution as any).ke_gained ?? 0,
      effort: (contribution as any).effort ?? undefined,
      effort_unit: (contribution as any).effort_unit ?? undefined,
      external_link: (contribution as any).external_link ?? undefined,
      views: (contribution as any).views ?? 0,
      created_at: (contribution as any).created_at,
      updated_at: (contribution as any).updated_at ?? undefined,
      reviews: formattedReviews,
      stats: {
        views: (contribution as any).views ?? 0,
        reviews: formattedReviews.length,
        keGained: (contribution as any).ke_gained ?? 0,
        avgConfidence,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};
