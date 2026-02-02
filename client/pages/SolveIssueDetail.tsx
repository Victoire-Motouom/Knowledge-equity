import Header from "@/components/Header";
import { useAuth } from "@/auth/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { SolveIssue, SolveIssueComment } from "@shared/api";
import EmojiAvatar from "@/components/EmojiAvatar";
import { renderMarkdown } from "@/lib/markdown";
import { handleMarkdownPaste } from "@/lib/pasteMarkdown";

const STATUS_OPTIONS: SolveIssue["status"][] = ["open", "closed"];

export default function SolveIssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const [issue, setIssue] = useState<SolveIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [comments, setComments] = useState<SolveIssueComment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<SolveIssueComment | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/solve-issues/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load issue");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setIssue(data.issue || null);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load issue");
      })
      .finally(() => mounted && setLoading(false));

    fetch(`/api/solve-issues/${id}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setComments(data.comments || []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load issue");
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const commentTree = comments.reduce(
    (acc, comment) => {
      const parentKey = comment.parentId ? String(comment.parentId) : "root";
      if (!acc[parentKey]) acc[parentKey] = [];
      acc[parentKey].push(comment);
      return acc;
    },
    {} as Record<string, SolveIssueComment[]>,
  );

  const renderThread = (parentId: number | null, depth = 0) => {
    const key = parentId ? String(parentId) : "root";
    const nodes = commentTree[key] || [];
    if (nodes.length === 0) return null;

    return (
      <div
        className={
          depth ? "ml-4 border-l border-border/70 pl-4 space-y-4" : "space-y-4"
        }
      >
        {nodes.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
              <div className="flex-1 w-px bg-border/60" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                  <EmojiAvatar handle={comment.author} size="sm" />
                  {comment.author}
                </span>
                <span>•</span>
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <div
                className="prose prose-sm max-w-none text-foreground mt-2 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(comment.body),
                }}
              />
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setReplyTo(comment)}
                  className="hover:text-foreground"
                >
                  Reply
                </button>
              </div>
              <div className="mt-3">{renderThread(comment.id, depth + 1)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const canUpdateStatus =
    !!accessToken && !!issue && issue.authorId === user?.id;

  const insertCommentTemplate = (template: string) => {
    const el = commentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = `${commentDraft.slice(0, start)}${template}${commentDraft.slice(end)}`;
    setCommentDraft(next);
    requestAnimationFrame(() => {
      const cursor = start + template.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const wrapCommentSelection = (
    before: string,
    after: string,
    placeholder: string,
  ) => {
    const el = commentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = commentDraft.slice(start, end) || placeholder;
    const next = `${commentDraft.slice(0, start)}${before}${selected}${after}${commentDraft.slice(end)}`;
    setCommentDraft(next);
    requestAnimationFrame(() => {
      const cursor = start + before.length + selected.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const submitComment = async () => {
    if (!issue) return;
    const trimmed = commentDraft.trim();
    if (!trimmed || !accessToken) return;
    try {
      setCommentSubmitting(true);
      const resp = await fetch("/api/solve-issue-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          issue_id: Number(issue.id),
          parent_id: replyTo?.id ?? null,
          body: trimmed,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to post comment");
      }
      setComments((prev) => [...prev, data.comment]);
      setCommentDraft("");
      setReplyTo(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to post comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const updateStatus = async (nextStatus: SolveIssue["status"]) => {
    if (!accessToken || !issue) return;
    if (issue.authorId && issue.authorId !== user?.id) return;
    try {
      setStatusUpdating(true);
      const resp = await fetch(`/api/solve-issues/${issue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to update status");
      }
      const data = await resp.json();
      setIssue(data.issue);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background page-surface">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-24 lg:pb-12">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        {loading && (
          <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
        )}
        {error && <div className="mt-6 text-sm text-destructive">{error}</div>}

        {issue && (
          <div className="glass-panel rounded-2xl p-6 mt-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Solve Issue
            </div>
            <h1 className="text-3xl font-semibold text-foreground mt-2">
              {issue.title}
            </h1>
            <p className="text-muted-foreground mt-3">{issue.summary}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="bg-muted/60 text-foreground px-2 py-1 rounded-full border border-border">
                {issue.domain}
              </span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                {issue.status.replace("_", " ")}
              </span>
              <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                Action: {issue.actionNeeded}
              </span>
              <span className="bg-background/60 text-foreground px-2 py-1 rounded-full border border-border">
                Impact {issue.impact}/10
              </span>
            </div>

            {canUpdateStatus && (
              <div className="mt-8">
                <div className="text-sm font-semibold text-foreground mb-2">
                  Update status
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => updateStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-sm border border-border transition-colors ${
                        issue.status === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground hover:bg-muted"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!accessToken && (
              <div className="mt-2 text-xs text-muted-foreground">
                Sign in to update status.
              </div>
            )}
            {accessToken && issue.authorId && issue.authorId !== user?.id && (
              <div className="mt-2 text-xs text-muted-foreground">
                Only the creator can update the status.
              </div>
            )}

            <div className="mt-10">
              <div className="text-sm font-semibold text-foreground mb-3">
                Discussion
              </div>
              <div className="space-y-4">
                {comments.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No discussion yet.
                  </div>
                )}
                {renderThread(null)}
              </div>
              <div className="mt-4 rounded-xl border border-border bg-background/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border px-3 py-2">
                  <div className="text-xs text-muted-foreground">
                    {replyTo ? (
                      <>
                        Replying to{" "}
                        <span className="font-medium text-foreground">
                          {replyTo.author}
                        </span>
                        <button
                          type="button"
                          className="ml-2 text-primary hover:underline"
                          onClick={() => setReplyTo(null)}
                        >
                          cancel
                        </button>
                      </>
                    ) : (
                      "Add a comment"
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => wrapCommentSelection("**", "**", "bold")}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapCommentSelection("_", "_", "italic")}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCommentTemplate("[text](https://)")}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      title="Link"
                    >
                      🔗
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCommentTemplate("\n> quote")}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      title="Quote"
                    >
                      ❝
                    </button>
                  </div>
                </div>
                <textarea
                  ref={commentRef}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onPaste={(e) =>
                    handleMarkdownPaste(e, commentDraft, setCommentDraft)
                  }
                  rows={4}
                  placeholder={
                    issue.status === "closed"
                      ? "Issue is closed"
                      : accessToken
                        ? "What are your thoughts?"
                        : "Sign in to comment"
                  }
                  disabled={
                    !accessToken ||
                    commentSubmitting ||
                    issue.status === "closed"
                  }
                  className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none"
                />
                <div className="flex items-center justify-between border-t border-border px-3 py-2">
                  {!accessToken ? (
                    <div className="text-xs text-muted-foreground">
                      You must be signed in to comment.
                    </div>
                  ) : issue.status === "closed" ? (
                    <div className="text-xs text-muted-foreground">
                      Comments are closed.
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Be constructive.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={submitComment}
                    disabled={
                      !accessToken ||
                      commentSubmitting ||
                      commentDraft.trim().length === 0 ||
                      issue.status === "closed"
                    }
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
                  >
                    {commentSubmitting ? "Posting…" : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
