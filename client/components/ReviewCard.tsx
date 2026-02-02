import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { handleMarkdownPaste } from "@/lib/pasteMarkdown";
import { useAuth } from "@/auth/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ReviewComment,
  ReviewCommentCreateResponse,
  ReviewCommentsResponse,
} from "@shared/api";

type Rating =
  | "confirmed_correct"
  | "novel_insight"
  | "valuable_incomplete"
  | "incorrect_constructive"
  | "not_credible";

type CommentNodeModel = {
  comment: ReviewComment;
  children: CommentNodeModel[];
  descendantCount: number; // number of replies under this comment (all depths)
  latestActivityTs: number; // max(created_at) across this node + descendants
};

type CommentSort = "old" | "new" | "top";

function hashToUnit(seed: number) {
  // Deterministic 0..1 (exclusive) from an integer seed.
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  // Convert to 0..1; avoid 0 which would break -log(u).
  const u = ((x >>> 0) % 1_000_000) / 1_000_000;
  return Math.min(0.999999, Math.max(0.000001, u));
}

function commentCreatedTs(c: ReviewComment) {
  return c.created_at ? new Date(c.created_at).getTime() : 0;
}

function weightedShuffleKey(u: number, weight: number) {
  // Efraimidis–Spirakis weighted random ordering key.
  // Smaller keys rank earlier.
  return -Math.log(u) / Math.max(0.0001, weight);
}

function buildThread(
  comments: ReviewComment[],
  sort: CommentSort,
  seedBase: number,
) {
  // Base ordering for building the parent/child relationships.
  // (We'll apply sibling ordering later depending on the selected sort.)
  const sorted = [...comments].sort((a, b) => {
    const ta = commentCreatedTs(a);
    const tb = commentCreatedTs(b);
    if (ta !== tb) return ta - tb;
    return a.id - b.id;
  });

  const nodeById = new Map<number, CommentNodeModel>();
  for (const c of sorted) {
    nodeById.set(c.id, {
      comment: c,
      children: [],
      descendantCount: 0,
      latestActivityTs: commentCreatedTs(c),
    });
  }

  const roots: CommentNodeModel[] = [];

  for (const c of sorted) {
    const node = nodeById.get(c.id)!;
    const parentId = c.parent_id ?? null;

    if (parentId && nodeById.has(parentId)) {
      nodeById.get(parentId)!.children.push(node);
    } else {
      // If parent is missing/invalid, treat as root.
      roots.push(node);
    }
  }

  const computeCountsAndActivity = (n: CommentNodeModel): number => {
    let total = 0;
    let latest = commentCreatedTs(n.comment);

    for (const child of n.children) {
      total += 1 + computeCountsAndActivity(child);
      latest = Math.max(latest, child.latestActivityTs);
    }

    n.descendantCount = total;
    n.latestActivityTs = latest;
    return total;
  };

  roots.forEach(computeCountsAndActivity);

  // Sort siblings according to requested sort.
  const now = Date.now();
  const sortChildren = (nodes: CommentNodeModel[]) => {
    if (sort === "new") {
      nodes.sort((a, b) => {
        if (a.latestActivityTs !== b.latestActivityTs)
          return b.latestActivityTs - a.latestActivityTs;
        return b.comment.id - a.comment.id;
      });
    } else if (sort === "top") {
      // "Top" = randomized, but biased toward:
      // - more recent activity
      // - more discussion (descendantCount)
      // This avoids explicit popularity metrics while still prioritizing active threads.
      nodes.sort((a, b) => {
        const ageHoursA = (now - a.latestActivityTs) / 3_600_000;
        const ageHoursB = (now - b.latestActivityTs) / 3_600_000;

        const recencyA = Math.exp(-ageHoursA / 24); // ~1 for fresh, decays over days
        const recencyB = Math.exp(-ageHoursB / 24);

        const weightA = 1 + a.descendantCount * 0.35 + recencyA * 2.0;
        const weightB = 1 + b.descendantCount * 0.35 + recencyB * 2.0;

        const keyA = weightedShuffleKey(
          hashToUnit(seedBase ^ a.comment.id),
          weightA,
        );
        const keyB = weightedShuffleKey(
          hashToUnit(seedBase ^ b.comment.id),
          weightB,
        );

        if (keyA !== keyB) return keyA - keyB;
        return a.comment.id - b.comment.id;
      });
    } else {
      // old
      nodes.sort((a, b) => {
        const ta = commentCreatedTs(a.comment);
        const tb = commentCreatedTs(b.comment);
        if (ta !== tb) return ta - tb;
        return a.comment.id - b.comment.id;
      });
    }

    for (const n of nodes) sortChildren(n.children);
  };

  sortChildren(roots);

  return roots;
}

function CommentNode(props: {
  node: CommentNodeModel;
  depth: number;
  onReply: (c: ReviewComment) => void;
  isExpanded: (id: number) => boolean;
  onToggleExpanded: (id: number) => void;
  maxDepth: number;
  isContinueEnabled: (id: number) => boolean;
  onContinueThread: (id: number) => void;
}) {
  const { node, depth } = props;
  const expanded = props.isExpanded(node.comment.id);

  return (
    <div
      className={cn("space-y-2", depth > 0 && "ml-4")}
      style={{ position: "relative" }}
    >
      {depth > 0 && (
        <div className="absolute -left-2 top-1 bottom-1 w-px bg-border/60" />
      )}

      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
          <div className="flex-1 w-px bg-border/60" />
        </div>
        <div
          className={cn(
            "flex-1 rounded-lg border border-border bg-card p-3 ios-transition",
            depth === 0 && "bg-muted/20",
          )}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {node.comment.author}
            </span>
            {node.comment.created_at && (
              <>
                <span>•</span>
                <span>{formatRelativeTime(node.comment.created_at)}</span>
              </>
            )}
          </div>

          <div className="mt-2 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {node.comment.body}
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => props.onReply(node.comment)}
            >
              Reply
            </button>
            {node.descendantCount > 0 && (
              <button
                type="button"
                className="hover:text-foreground underline-offset-4 hover:underline"
                onClick={() => props.onToggleExpanded(node.comment.id)}
              >
                {expanded ? "Hide" : "Show"} replies ({node.descendantCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Continue thread: prevent overly deep indent chains */}
      {expanded &&
      node.children.length > 0 &&
      depth >= props.maxDepth &&
      !props.isContinueEnabled(node.comment.id) ? (
        <div className="ml-4">
          <button
            type="button"
            className="text-xs text-primary hover:underline underline-offset-4"
            onClick={() => props.onContinueThread(node.comment.id)}
          >
            Continue thread ({node.children.length})
          </button>
        </div>
      ) : (
        expanded &&
        node.children.length > 0 && (
          <div className="space-y-2">
            {node.children.map((child) => (
              <CommentNode
                key={child.comment.id}
                node={child}
                depth={depth + 1}
                onReply={props.onReply}
                isExpanded={props.isExpanded}
                onToggleExpanded={props.onToggleExpanded}
                maxDepth={props.maxDepth}
                isContinueEnabled={props.isContinueEnabled}
                onContinueThread={props.onContinueThread}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

const MAX_THREAD_DEPTH = 3;

export function ReviewCard(props: {
  id: number;
  reviewer: string;
  rating: Rating;
  confidence: number;
  comment: string;
  ke_awarded?: number | null;
  created_at?: string | null;
}) {
  const { accessToken, user } = useAuth();
  const isAuthenticated = Boolean(accessToken && user);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [commentsCount, setCommentsCount] = useState<number | null>(null);

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ReviewComment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);

  const insertCommentTemplate = (template: string) => {
    const el = commentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = `${draft.slice(0, start)}${template}${draft.slice(end)}`;
    setDraft(next);
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
    const selected = draft.slice(start, end) || placeholder;
    const next = `${draft.slice(0, start)}${before}${selected}${after}${draft.slice(end)}`;
    setDraft(next);
    requestAnimationFrame(() => {
      const cursor = start + before.length + selected.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  useEffect(() => {
    let mounted = true;

    const fetchComments = async (forPreview: boolean) => {
      if (!forPreview) {
        setLoading(true);
        setLoadError(null);
      }

      try {
        const resp = await fetch(
          `/api/reviews/${encodeURIComponent(String(props.id))}/comments`,
        );
        const payload = (await resp.json()) as ReviewCommentsResponse | any;
        if (!mounted) return;
        if (payload?.error) {
          if (!forPreview) {
            setLoadError(payload.error);
            setComments([]);
          }
          return;
        }
        const nextComments = (payload?.comments || []) as ReviewComment[];
        setCommentsCount(nextComments.length);
        if (!forPreview) {
          setComments(nextComments);
        }
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        if (!forPreview) {
          setLoadError("Failed to load comments");
        }
      } finally {
        if (!forPreview && mounted) {
          setLoading(false);
        }
      }
    };

    fetchComments(true);

    return () => {
      mounted = false;
    };
  }, [props.id]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    const fetchOpenComments = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const resp = await fetch(
          `/api/reviews/${encodeURIComponent(String(props.id))}/comments`,
        );
        const payload = (await resp.json()) as ReviewCommentsResponse | any;
        if (!mounted) return;
        if (payload?.error) {
          setLoadError(payload.error);
          setComments([]);
          return;
        }
        const nextComments = (payload?.comments || []) as ReviewComment[];
        setComments(nextComments);
        setCommentsCount(nextComments.length);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setLoadError("Failed to load comments");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOpenComments();

    return () => {
      mounted = false;
    };
  }, [open, props.id]);

  const [sort, setSort] = useState<CommentSort>("old");
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});
  const [continueThreadMap, setContinueThreadMap] = useState<
    Record<number, boolean>
  >({});

  const threadRoots = useMemo(
    () => buildThread(comments, sort, Number(props.id) || 0),
    [comments, sort, props.id],
  );

  const totalComments = commentsCount ?? comments.length;

  // Initialize expansion for newly loaded comments (default expanded)
  useEffect(() => {
    if (!open) return;
    setExpandedMap((prev) => {
      const next = { ...prev };
      for (const c of comments) {
        if (next[c.id] === undefined) next[c.id] = true;
      }
      return next;
    });
  }, [comments, open]);

  const isExpanded = (id: number) => expandedMap[id] !== false;
  const toggleExpanded = (id: number) =>
    setExpandedMap((prev) => ({ ...prev, [id]: !(prev[id] !== false) }));

  const setAllExpanded = (value: boolean) => {
    setExpandedMap((prev) => {
      const next: Record<number, boolean> = { ...prev };
      for (const c of comments) next[c.id] = value;
      return next;
    });
  };

  const isContinueEnabled = (id: number) => continueThreadMap[id] === true;
  const enableContinueThread = (id: number) =>
    setContinueThreadMap((prev) => ({ ...prev, [id]: true }));

  const labelByRating: Record<Rating, { label: string; tone: string }> = {
    confirmed_correct: {
      label: "Confirmed",
      tone: "bg-emerald-100 text-emerald-900",
    },
    novel_insight: { label: "Novel", tone: "bg-indigo-100 text-indigo-900" },
    valuable_incomplete: {
      label: "Valuable",
      tone: "bg-amber-100 text-amber-950",
    },
    incorrect_constructive: {
      label: "Constructive",
      tone: "bg-sky-100 text-sky-950",
    },
    not_credible: { label: "Not credible", tone: "bg-red-100 text-red-900" },
  };

  const ratingMeta = labelByRating[props.rating];

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {props.reviewer}
            </span>
            {props.created_at && (
              <span className="text-xs text-muted-foreground">
                · {formatRelativeTime(props.created_at)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                ratingMeta.tone,
              )}
            >
              {ratingMeta.label}
            </span>
            <span>Confidence: {props.confidence}%</span>
            {typeof props.ke_awarded === "number" && (
              <span>Reviewer KE: +{props.ke_awarded}</span>
            )}
          </div>
        </div>
      </header>

      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {props.comment}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            import("@/lib/haptics").then(({ haptic }) => haptic("tap"));
            setOpen((v) => !v);
          }}
        >
          {open ? "Hide discussion" : "Show discussion"} ({totalComments})
        </button>

        {open && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {/* On mobile keep controls from wrapping too aggressively */}
            <button
              type="button"
              className="hover:text-foreground underline-offset-4 hover:underline"
              onClick={() => setAllExpanded(true)}
            >
              Expand all
            </button>
            <button
              type="button"
              className="hover:text-foreground underline-offset-4 hover:underline"
              onClick={() => setAllExpanded(false)}
            >
              Collapse all
            </button>

            <span className="mx-1">·</span>

            <label className="flex items-center gap-2">
              <span>Sort</span>
              <select
                className="rounded-md border border-border bg-background px-2 py-1"
                value={sort}
                onChange={(e) => setSort(e.target.value as CommentSort)}
              >
                <option value="old">Old</option>
                <option value="new">New</option>
                <option value="top">Top</option>
              </select>
            </label>
          </div>
        )}

        {open && (
          <div className="mt-3 space-y-3">
            {loading && (
              <div className="text-xs text-muted-foreground">
                Loading comments…
              </div>
            )}
            {loadError && (
              <div className="text-xs text-red-600">{loadError}</div>
            )}

            {/* Composer */}
            <div className="rounded-xl border border-border bg-background/80">
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
                className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none"
                rows={3}
                placeholder={
                  isAuthenticated
                    ? "What are your thoughts?"
                    : "Log in to comment"
                }
                disabled={!isAuthenticated || submitting}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onPaste={(e) => handleMarkdownPaste(e, draft, setDraft)}
              />
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                {!isAuthenticated ? (
                  <div className="text-xs text-muted-foreground">
                    You must be logged in to comment.
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Be constructive. Attack ideas, not people.
                  </div>
                )}
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50"
                  disabled={
                    !isAuthenticated || submitting || draft.trim().length === 0
                  }
                  onClick={async () => {
                    if (!isAuthenticated || !accessToken) return;
                    const body = draft.trim();
                    if (!body) return;

                    setSubmitting(true);
                    try {
                      const resp = await fetch("/api/review-comments", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                          review_id: props.id,
                          parent_id: replyTo ? replyTo.id : null,
                          body,
                        }),
                      });

                      const payload = (await resp.json()) as
                        | ReviewCommentCreateResponse
                        | any;
                      if (!resp.ok || payload?.error) {
                        throw new Error(
                          payload?.error || "Failed to post comment",
                        );
                      }

                      setComments((prev) => [...prev, payload.comment]);
                      setDraft("");
                      setReplyTo(null);
                    } catch (e) {
                      console.error(e);
                      // keep draft
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "Posting…" : replyTo ? "Reply" : "Comment"}
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="space-y-2">
              {threadRoots.map((node) => (
                <CommentNode
                  key={node.comment.id}
                  node={node}
                  depth={0}
                  onReply={(target) => {
                    setReplyTo(target);
                    setOpen(true);
                  }}
                  isExpanded={isExpanded}
                  onToggleExpanded={toggleExpanded}
                  maxDepth={MAX_THREAD_DEPTH}
                  isContinueEnabled={isContinueEnabled}
                  onContinueThread={enableContinueThread}
                />
              ))}

              {totalComments === 0 && !loading && !loadError && (
                <div className="text-xs text-muted-foreground">
                  No comments yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
