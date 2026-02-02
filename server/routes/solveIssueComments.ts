import type { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabaseServer";
import { SolveIssueCommentCreateSchema } from "../lib/validation";

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

// GET /api/solve-issues/:id/comments
export const handleGetSolveIssueComments: RequestHandler = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    if (!Number.isFinite(issueId)) {
      return res.status(400).json({ error: "Invalid issue id" });
    }

    const { data: rows, error } = await supabasePublic
      .from("solve_issue_comments")
      .select(
        `
        id,
        issue_id,
        author,
        parent_id,
        body,
        created_at,
        updated_at,
        users!solve_issue_comments_author_fkey(handle)
      `,
      )
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch solve issue comments error:", error);
      return res.status(500).json({ error: error.message });
    }

    const comments = (rows || []).map((r: any) => ({
      id: r.id,
      issueId: r.issue_id,
      author: r.users?.handle || "unknown",
      authorId: r.author,
      parentId: r.parent_id,
      body: r.body,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return res.json({ comments });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/solve-issue-comments
export const handleCreateSolveIssueComment: RequestHandler = async (
  req,
  res,
) => {
  try {
    const parsed = SolveIssueCommentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const authUser = req.auth?.user;
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    let authorUser: any;
    try {
      authorUser = await ensureUserRow(authUser);
    } catch (e: any) {
      console.error("ensureUserRow error", e);
      return res
        .status(500)
        .json({ error: e?.message || "Failed to ensure user" });
    }

    const { issue_id, parent_id, body } = parsed.data;

    const { data: issueRow, error: issueErr } = await supabaseAdmin
      .from("solve_issues")
      .select("id, status")
      .eq("id", issue_id)
      .maybeSingle();

    if (issueErr) return res.status(500).json({ error: issueErr.message });
    if (!issueRow) return res.status(404).json({ error: "Issue not found" });
    if ((issueRow as any).status === "closed") {
      return res.status(403).json({ error: "Issue is closed" });
    }

    if (parent_id) {
      const { data: parentRow, error: parentErr } = await supabaseAdmin
        .from("solve_issue_comments")
        .select("id, issue_id")
        .eq("id", parent_id)
        .maybeSingle();

      if (parentErr) return res.status(500).json({ error: parentErr.message });
      if (!parentRow)
        return res.status(404).json({ error: "Parent comment not found" });
      if (Number((parentRow as any).issue_id) !== issue_id) {
        return res
          .status(400)
          .json({ error: "Parent comment does not belong to this issue" });
      }
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("solve_issue_comments")
      .insert({
        issue_id,
        parent_id: parent_id ?? null,
        author: authorUser.id,
        body,
      })
      .select(
        `
        id,
        issue_id,
        author,
        parent_id,
        body,
        created_at,
        updated_at,
        users!solve_issue_comments_author_fkey(handle)
      `,
      )
      .single();

    if (insErr || !inserted) {
      console.error("Insert solve issue comment error:", insErr);
      return res
        .status(500)
        .json({ error: insErr?.message || "Failed to insert comment" });
    }

    return res.status(201).json({
      comment: {
        id: (inserted as any).id,
        issueId: (inserted as any).issue_id,
        author: (inserted as any).users?.handle || "unknown",
        authorId: (inserted as any).author,
        parentId: (inserted as any).parent_id,
        body: (inserted as any).body,
        createdAt: (inserted as any).created_at,
        updatedAt: (inserted as any).updated_at,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
