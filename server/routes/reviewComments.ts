import type { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabaseServer";
import { ReviewCommentCreateSchema } from "../lib/validation";

// Mirrors ensureUserRow helper logic from other routes.
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
 * GET /api/reviews/:id/comments
 * Returns a flat list of comments for a review (client can build tree).
 */
export const handleGetReviewComments: RequestHandler = async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    if (!Number.isFinite(reviewId)) {
      return res.status(400).json({ error: "Invalid review id" });
    }

    const { data: rows, error } = await supabasePublic
      .from("review_comments")
      .select(
        `
        id,
        review_id,
        author,
        parent_id,
        body,
        created_at,
        updated_at,
        users!review_comments_author_fkey(handle)
      `,
      )
      .eq("review_id", reviewId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch review comments error:", error);
      return res.status(500).json({ error: error.message });
    }

    const comments = (rows || []).map((r: any) => ({
      id: r.id,
      review_id: r.review_id,
      author: r.users?.handle || "unknown",
      author_id: r.author,
      parent_id: r.parent_id,
      body: r.body,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    return res.json({ comments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/review-comments
 * Body: { review_id, parent_id?, body }
 * Auth required.
 */
export const handleCreateReviewComment: RequestHandler = async (req, res) => {
  try {
    const parsed = ReviewCommentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
    }

    const authUser = req.auth?.user;
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    // Ensure FK user row exists.
    let authorUser: any;
    try {
      authorUser = await ensureUserRow(authUser);
    } catch (e: any) {
      console.error("ensureUserRow error", e);
      return res
        .status(500)
        .json({ error: e?.message || "Failed to ensure user" });
    }

    const { review_id, parent_id, body } = parsed.data;

    // Verify review exists (and parent comment belongs to same review if provided)
    const { data: reviewRow, error: reviewErr } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("id", review_id)
      .maybeSingle();

    if (reviewErr) return res.status(500).json({ error: reviewErr.message });
    if (!reviewRow) return res.status(404).json({ error: "Review not found" });

    if (parent_id) {
      const { data: parentRow, error: parentErr } = await supabaseAdmin
        .from("review_comments")
        .select("id, review_id")
        .eq("id", parent_id)
        .maybeSingle();

      if (parentErr) return res.status(500).json({ error: parentErr.message });
      if (!parentRow)
        return res.status(404).json({ error: "Parent comment not found" });
      if (Number((parentRow as any).review_id) !== review_id) {
        return res
          .status(400)
          .json({ error: "Parent comment does not belong to this review" });
      }
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("review_comments")
      .insert({
        review_id,
        parent_id: parent_id ?? null,
        author: authorUser.id,
        body,
      })
      .select(
        `
        id,
        review_id,
        author,
        parent_id,
        body,
        created_at,
        updated_at,
        users!review_comments_author_fkey(handle)
      `,
      )
      .single();

    if (insErr || !inserted) {
      console.error("Insert review comment error:", insErr);
      return res
        .status(500)
        .json({ error: insErr?.message || "Failed to insert comment" });
    }

    return res.status(201).json({
      comment: {
        id: (inserted as any).id,
        review_id: (inserted as any).review_id,
        author: (inserted as any).users?.handle || "unknown",
        author_id: (inserted as any).author,
        parent_id: (inserted as any).parent_id,
        body: (inserted as any).body,
        created_at: (inserted as any).created_at,
        updated_at: (inserted as any).updated_at,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
