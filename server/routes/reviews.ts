/**
 * Review API Routes
 * Handles submission and retrieval of contribution reviews
 */

import { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabaseServer";
import { calculateTotalKE, calculateReviewerKE } from "../lib/keCalculation";
import type { ReviewResponse } from "../../shared/api";
import type { ReviewInput, ContributionInput } from "../lib/keCalculation";
import { ReviewSubmitSchema } from "../lib/validation";

async function ensureUserRow(authUser: any) {
  const authUserId = authUser.id as string;
  const email = (authUser.email as string | null) ?? null;

  const { data: byId } = await supabaseAdmin
    .from("users")
    .select("id, handle, email, created_at")
    .eq("id", authUserId)
    .maybeSingle();

  if (byId) return byId;

  if (email) {
    const { data: byEmail } = await supabaseAdmin
      .from("users")
      .select("id, handle, email, created_at")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) return byEmail;
  }

  const baseFromEmail = email ? email.split("@")[0] : null;
  const baseFromMeta =
    (authUser.user_metadata as any)?.handle ||
    (authUser.user_metadata as any)?.username ||
    (authUser.user_metadata as any)?.name ||
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

/**
 * POST /api/reviews
 * Submit a new review for a contribution
 *
 * Request body: ReviewSubmit
 * - contribution_id: number
 * - rating: ReviewRating
 * - confidence: number (0-100)
 * - comment: string
 *
 * Auth: requires Authorization: Bearer <supabase access_token>
 * Validation: prevents self-review and duplicate reviews per reviewer
 */
export const handleSubmitReview: RequestHandler = async (req, res) => {
  try {
    const parsed = ReviewSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const { contribution_id, rating, confidence, comment } = parsed.data;

    // `requireAuth` middleware guarantees req.auth.
    const authUser = req.auth?.user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const reviewer_id = authUser.id;

    // Ensure a matching row exists in public.users for FK relations.
    let reviewerUser: any;
    try {
      reviewerUser = await ensureUserRow(authUser);
    } catch (e: any) {
      console.error("ensureUserRow error", e);
      return res
        .status(500)
        .json({ error: e?.message || "Failed to ensure user" });
    }

    // 1. Get the contribution and verify it exists
    const { data: contribution, error: fetchError } = await supabaseAdmin
      .from("contributions")
      .select("id, author, domain, type, ke_gained")
      .eq("id", contribution_id)
      .single();

    if (fetchError || !contribution) {
      return res.status(404).json({ error: "Contribution not found" });
    }

    // 2. Prevent self-review
    if (contribution.author === reviewer_id) {
      return res.status(403).json({
        error: "You cannot review your own contributions",
      });
    }

    // 3. Check if reviewer already reviewed this (fast-path)
    const { data: existing_review } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("contribution_id", contribution_id)
      .eq("reviewer", reviewer_id)
      .maybeSingle();

    if (existing_review) {
      return res.status(409).json({
        error: "You have already reviewed this contribution",
      });
    }

    // 4. Fetch existing reviews (for KE calculation)
    const { data: existing_reviews, error: existingErr } = await supabaseAdmin
      .from("reviews")
      .select("rating, confidence, reviewer")
      .eq("contribution_id", contribution_id);

    if (existingErr) {
      console.error("Fetch existing reviews error:", existingErr);
      return res.status(500).json({ error: existingErr.message });
    }

    const existingReviewerIds = Array.from(
      new Set(
        (existing_reviews || []).map((r: any) => r.reviewer).filter(Boolean),
      ),
    ) as string[];

    // 5. Fetch reviewer KE in domain for all reviewers in one go (including this reviewer)
    const allReviewerIds = Array.from(
      new Set([...existingReviewerIds, reviewer_id]),
    );

    const { data: keRows, error: keRowsErr } = await supabaseAdmin
      .from("user_ke")
      .select("user_id, ke_amount")
      .eq("domain", contribution.domain)
      .in("user_id", allReviewerIds);

    if (keRowsErr) {
      console.error("Fetch user_ke error:", keRowsErr);
      return res.status(500).json({ error: keRowsErr.message });
    }

    const keByUser = new Map<string, number>();
    for (const row of keRows || []) {
      keByUser.set((row as any).user_id, Number((row as any).ke_amount ?? 0));
    }

    const reviewer_ke_in_domain = keByUser.get(reviewer_id) ?? 0;

    // 6. Calculate new KE for the contribution (existing + this new review)
    const review_inputs: ReviewInput[] = [
      ...(existing_reviews || []).map((review: any) => ({
        rating: review.rating as any,
        confidence: review.confidence,
        reviewer_ke_in_domain: keByUser.get(review.reviewer) ?? 0,
      })),
      {
        rating: rating as any,
        confidence,
        reviewer_ke_in_domain,
      },
    ];

    const contribution_input: ContributionInput = {
      type: contribution.type as any,
      existing_reviews: review_inputs,
    };

    const ke_calculation = calculateTotalKE(contribution_input);
    const new_contribution_ke = ke_calculation.total_ke;
    const new_reviews_count = review_inputs.length;

    // 7. Calculate KE earned by this reviewer
    const reviewer_ke_earned = calculateReviewerKE(
      new_contribution_ke,
      confidence,
    );

    // 8. Perform all DB writes atomically in a single transaction.
    const { data: rpcRows, error: rpcErr } = await supabaseAdmin.rpc(
      "submit_review_atomic",
      {
        p_contribution_id: contribution_id,
        p_reviewer_id: reviewer_id,
        p_rating: rating,
        p_confidence: confidence,
        p_comment: comment,
        p_new_contribution_ke: new_contribution_ke,
        p_new_reviews_count: new_reviews_count,
        p_reviewer_ke_earned: reviewer_ke_earned,
      },
    );

    if (rpcErr || !rpcRows || rpcRows.length === 0) {
      const code = (rpcErr as any)?.code;

      // If the server is misconfigured and uses the anon key, PostgREST will hide
      // this function (no EXECUTE privilege), and we get PGRST202.
      if (code === "PGRST202") {
        console.error(
          "submit_review_atomic missing from PostgREST schema cache (likely server using anon key or migration not applied):",
          rpcErr,
        );
        return res.status(500).json({
          error:
            "Review RPC not available. Ensure SUPABASE_SERVICE_ROLE_KEY is set for the server and the migration defining submit_review_atomic has been applied.",
        });
      }
      if (code === "P0002")
        return res.status(404).json({ error: "Contribution not found" });
      if (code === "P0003") {
        return res
          .status(403)
          .json({ error: "You cannot review your own contributions" });
      }
      if (code === "P0004") {
        return res
          .status(409)
          .json({ error: "You have already reviewed this contribution" });
      }

      // Unique constraint violation (race)
      if (code === "23505") {
        return res
          .status(409)
          .json({ error: "You have already reviewed this contribution" });
      }

      console.error("submit_review_atomic rpc error:", rpcErr);
      return res
        .status(500)
        .json({ error: rpcErr?.message || "Failed to submit review" });
    }

    const rpcRow = rpcRows[0] as any;

    // 9. Return review response
    const response: ReviewResponse = {
      review: {
        id: rpcRow.review_id,
        contribution_id,
        reviewer: reviewerUser?.handle || "unknown",
        reviewer_id,
        rating,
        confidence,
        comment,
        ke_awarded: reviewer_ke_earned,
        created_at: rpcRow.review_created_at,
      },
      contribution_ke_updated: new_contribution_ke,
    };

    res.status(201).json(response);
  } catch (err) {
    console.error("Review submission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/contributions/:id/reviews
 * Get all reviews for a specific contribution
 */
export const handleGetReviews: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing contribution ID" });
    }

    // Fetch reviews with reviewer handles
    const { data: reviews, error } = await supabasePublic
      .from("reviews")
      .select(
        `
        id,
        contribution_id,
        reviewer,
        rating,
        confidence,
        comment,
        ke_awarded,
        created_at,
        users!reviews_reviewer_fkey(handle)
      `,
      )
      .eq("contribution_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch reviews error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Transform to match Review interface
    const formatted_reviews = (reviews || []).map((r: any) => ({
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

    res.json({ reviews: formatted_reviews });
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
