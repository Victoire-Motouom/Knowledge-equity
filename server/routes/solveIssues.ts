import { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabaseServer";
import {
  SolveIssueCreateSchema,
  SolveIssueStatusUpdateSchema,
} from "../lib/validation";
import type { SolveIssueResponse } from "@shared/api";

// GET /api/solve-issues
export const handleSolveIssues: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabasePublic
      .from("solve_issues")
      .select(
        "id, title, summary, domain, impact, action_needed, status, created_at, author, users!solve_issues_author_fkey(handle)",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Fetch solve issues error:", error);
      return res.status(500).json({ error: error.message });
    }

    const issues = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      domain: row.domain,
      impact: row.impact,
      actionNeeded: row.action_needed,
      status: row.status,
      authorId: row.author ?? undefined,
      authorHandle: row.users?.handle || undefined,
      createdAt: row.created_at,
    }));

    res.setHeader("Cache-Control", "public, max-age=30");
    return res.json({ issues } satisfies SolveIssueResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

// POST /api/solve-issues
export const handleCreateSolveIssue: RequestHandler = async (req, res) => {
  try {
    const parsed = SolveIssueCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const authUser = req.auth?.user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, summary, domain, impact, actionNeeded } = parsed.data;
    const { data, error } = await supabaseAdmin
      .from("solve_issues")
      .insert({
        title,
        summary,
        domain,
        impact,
        action_needed: actionNeeded,
        status: "open",
        author: authUser.id,
      })
      .select(
        "id, title, summary, domain, impact, action_needed, status, created_at, author, users!solve_issues_author_fkey(handle)",
      )
      .single();

    if (error || !data) {
      console.error("Create solve issue error:", error);
      return res
        .status(500)
        .json({ error: error?.message || "Failed to create issue" });
    }

    const issuePayload = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      domain: data.domain,
      impact: data.impact,
      actionNeeded: data.action_needed,
      status: data.status,
      authorId: data.author ?? undefined,
      authorHandle: data.users?.handle || undefined,
      createdAt: data.created_at,
    };

    const { data: userRows } = await supabaseAdmin
      .from("users")
      .select("id");

    if (userRows && userRows.length > 0) {
      const { error: notifyError } = await supabaseAdmin.from("notifications").insert(
        userRows.map((u: any) => ({
          user_id: u.id,
          title: "New solve issue",
          body: `${data.users?.handle || "Someone"} posted: ${data.title}`,
          link: `/solve/${data.id}`,
        })),
      );
      if (notifyError) {
        console.error("Notification insert error:", notifyError);
      }
    }

    return res.status(201).json({ issue: issuePayload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

// GET /api/solve-issues/:id
export const handleSolveIssueDetail: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { data, error } = await supabasePublic
      .from("solve_issues")
      .select(
        "id, title, summary, domain, impact, action_needed, status, created_at, author, users!solve_issues_author_fkey(handle)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Fetch solve issue detail error:", error);
      return res.status(500).json({ error: error.message });
    }
    if (!data) return res.status(404).json({ error: "Not found" });

    return res.json({
      issue: {
        id: data.id,
        title: data.title,
        summary: data.summary,
        domain: data.domain,
        impact: data.impact,
        actionNeeded: data.action_needed,
        status: data.status,
        authorId: data.author ?? undefined,
        authorHandle: data.users?.handle || undefined,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};

// PATCH /api/solve-issues/:id
export const handleUpdateSolveIssueStatus: RequestHandler = async (
  req,
  res,
) => {
  try {
    const parsed = SolveIssueStatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { data: issueRow, error: issueErr } = await supabaseAdmin
      .from("solve_issues")
      .select("id, author")
      .eq("id", id)
      .maybeSingle();

    if (issueErr) return res.status(500).json({ error: issueErr.message });
    if (!issueRow) return res.status(404).json({ error: "Not found" });
    if (issueRow.author !== req.auth?.user?.id) {
      return res
        .status(403)
        .json({ error: "Only the creator can update status" });
    }

    const { data, error } = await supabaseAdmin
      .from("solve_issues")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select(
        "id, title, summary, domain, impact, action_needed, status, created_at, author, users!solve_issues_author_fkey(handle)",
      )
      .single();

    if (error || !data) {
      console.error("Update solve issue status error:", error);
      return res
        .status(500)
        .json({ error: error?.message || "Failed to update issue" });
    }

    return res.json({
      issue: {
        id: data.id,
        title: data.title,
        summary: data.summary,
        domain: data.domain,
        impact: data.impact,
        actionNeeded: data.action_needed,
        status: data.status,
        authorId: data.author ?? undefined,
        authorHandle: data.users?.handle || undefined,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
};
