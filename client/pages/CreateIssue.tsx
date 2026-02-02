import Header from "@/components/Header";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";
import { handleMarkdownPaste } from "@/lib/pasteMarkdown";
import { renderMarkdown } from "@/lib/markdown";
import type { SolveIssue } from "@shared/api";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateIssue() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [impact, setImpact] = useState(5);
  const [domain, setDomain] = useState("");
  const [actionNeeded, setActionNeeded] =
    useState<SolveIssue["actionNeeded"]>("awareness");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);

  const previewHtml = useMemo(() => {
    const raw = summary.trim();
    if (!raw) {
      return '<p><span class="text-muted-foreground">Nothing to preview yet.</span></p>';
    }
    return renderMarkdown(raw);
  }, [summary]);

  const insertTemplate = (template: string) => {
    const el = summaryRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = `${summary.slice(0, start)}${template}${summary.slice(end)}`;
    setSummary(next);
    requestAnimationFrame(() => {
      const cursor = start + template.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (
    before: string,
    after: string,
    placeholder: string,
  ) => {
    const el = summaryRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = summary.slice(start, end) || placeholder;
    const next = `${summary.slice(0, start)}${before}${selected}${after}${summary.slice(end)}`;
    setSummary(next);
    requestAnimationFrame(() => {
      const cursor = start + before.length + selected.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const submit = async () => {
    setError(null);
    if (!accessToken) {
      setError("Please sign in to create an issue.");
      return;
    }
    if (!title.trim() || !summary.trim() || !domain.trim()) {
      setError("Title, domain, and summary are required.");
      return;
    }

    try {
      setSubmitting(true);
      const resp = await fetch("/api/solve-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          domain: domain.trim(),
          impact,
          actionNeeded,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to create issue");
      }

      const id = data?.issue?.id;
      if (id) {
        navigate(`/solve/${id}`);
      } else {
        navigate("/feed?mode=solve");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create issue");
    } finally {
      setSubmitting(false);
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

        <div className="mt-6 glass-panel rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Create Issue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a problem statement and what kind of action is needed.
          </p>

          {error && (
            <div className="mt-4 text-sm text-destructive">{error}</div>
          )}

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Domain"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-background overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border px-3 py-2">
              <div className="inline-flex rounded-full bg-muted/50 p-1">
                {(
                  [
                    { key: "write", label: "Write" },
                    { key: "preview", label: "Preview" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-full",
                      tab === item.key
                        ? "bg-background text-foreground shadow"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => wrapSelection("## ", "", "Heading")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Heading"
                >
                  H
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("**", "**", "bold text")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("_", "_", "italic text")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("\n```\ncode\n```")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Code block"
                >
                  &lt;&gt;
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("[text](https://)")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Link"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("\n- list item")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="List"
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate("\n> quote")}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  title="Quote"
                >
                  ❝
                </button>
              </div>
            </div>
            {tab === "write" ? (
              <textarea
                ref={summaryRef}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                onPaste={(e) => handleMarkdownPaste(e, summary, setSummary)}
                placeholder="Describe the issue, impact, and current context"
                className="w-full rounded-none border-0 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px]"
              />
            ) : (
              <div
                className="prose prose-sm max-w-none px-4 py-4 text-foreground"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">
                Impact (1–10)
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={impact}
                onChange={(e) => setImpact(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground mt-1">
                {impact}/10
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">
                Action needed
              </div>
              <select
                value={actionNeeded}
                onChange={(e) =>
                  setActionNeeded(e.target.value as SolveIssue["actionNeeded"])
                }
                className="w-full px-3 py-2 border border-border rounded-xl bg-background"
              >
                <option value="awareness">Awareness</option>
                <option value="funding">Funding</option>
                <option value="code">Code</option>
                <option value="policy">Policy</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Create issue"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/feed?mode=solve")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
