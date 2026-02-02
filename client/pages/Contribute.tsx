import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/auth/AuthContext";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { handleMarkdownPaste } from "@/lib/pasteMarkdown";
import { toast } from "@/components/ui/use-toast";
import { CONTRIBUTION_TYPES, type ContributionType } from "@shared/api";
import { Link as LinkIcon, FileText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type PostMode = "text" | "link";

export default function Contribute() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [mode, setMode] = useState<PostMode>("text");
  const [type, setType] = useState<ContributionType>("explanation");

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [shareAfterPost, setShareAfterPost] = useState(true);
  const [bodyTab, setBodyTab] = useState<"write" | "preview">("write");
  const [canResizeBody, setCanResizeBody] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainResults, setDomainResults] = useState<
    { id: string; label: string; description?: string }[]
  >([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (bodyTab !== "write") return;
    const el = bodyRef.current;
    if (!el) return;
    const shouldResize = el.scrollHeight > el.clientHeight + 4;
    setCanResizeBody(shouldResize);
  }, [body, bodyTab]);

  const previewHtml = useMemo(() => {
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const formatInline = (value: string) => {
      const escaped = escapeHtml(value);
      const codeTokens: string[] = [];
      let output = escaped.replace(/`([^`]+)`/g, (_match, code) => {
        const token = `__CODE_${codeTokens.length}__`;
        codeTokens.push(code);
        return token;
      });

      output = output.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      output = output.replace(/_(.*?)_/g, "<em>$1</em>");
      output = output.replace(
        /\[(.+?)\]\((https?:\/\/[^\s]+)\)/g,
        '<a class="text-primary underline" href="$2" target="_blank" rel="noreferrer">$1</a>',
      );

      codeTokens.forEach((code, idx) => {
        output = output.replace(
          `__CODE_${idx}__`,
          `<code class=\"rounded bg-muted px-1\">${code}</code>`,
        );
      });

      return output;
    };

    const renderBlock = (block: string) => {
      const lines = block.split("\n");
      const html: string[] = [];
      let listBuffer: string[] = [];

      const flushList = () => {
        if (listBuffer.length) {
          html.push(
            `<ul class=\"list-disc pl-6 space-y-1\">${listBuffer.join("")}</ul>`,
          );
          listBuffer = [];
        }
      };

      for (const line of lines) {
        if (!line.trim()) {
          flushList();
          continue;
        }

        const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
        if (headingMatch) {
          flushList();
          const level = headingMatch[1].length;
          html.push(
            `<h${level} class=\"mt-4 text-foreground font-semibold\">${formatInline(
              headingMatch[2],
            )}</h${level}>`,
          );
          continue;
        }

        const quoteMatch = /^>\s?(.*)$/.exec(line);
        if (quoteMatch) {
          flushList();
          html.push(
            `<blockquote class=\"border-l-2 border-primary/60 pl-4 text-muted-foreground\">${formatInline(
              quoteMatch[1],
            )}</blockquote>`,
          );
          continue;
        }

        const listMatch = /^-\s+(.*)$/.exec(line);
        if (listMatch) {
          listBuffer.push(`<li>${formatInline(listMatch[1])}</li>`);
          continue;
        }

        flushList();
        html.push(`<p class=\"mt-3\">${formatInline(line)}</p>`);
      }

      flushList();
      return html.join("");
    };

    const raw = body.trim();
    if (!raw) {
      return '<p><span class="text-muted-foreground">Nothing to preview yet.</span></p>';
    }

    const parts: string[] = [];
    const regex = /```([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw))) {
      const before = raw.slice(lastIndex, match.index);
      if (before.trim()) {
        parts.push(renderBlock(before.trim()));
      }
      const code = escapeHtml(match[1].trim());
      parts.push(
        `<pre class=\"mt-3 rounded-xl bg-muted/60 p-4 text-xs overflow-x-auto\"><code>${code}</code></pre>`,
      );
      lastIndex = match.index + match[0].length;
    }

    const remaining = raw.slice(lastIndex).trim();
    if (remaining) {
      parts.push(renderBlock(remaining));
    }

    return parts.join("");
  }, [body]);

  const domainMatchesExact = useMemo(() => {
    const normalized = domain.trim().toLowerCase();
    return domainResults.some(
      (item) => item.label.toLowerCase() === normalized,
    );
  }, [domain, domainResults]);

  const canSubmit = useMemo(() => {
    if (title.trim().length < 3) return false;
    if (domain.trim().length < 2) return false;
    if (body.trim().length < 50) return false;
    if (mode === "link") {
      try {
        // eslint-disable-next-line no-new
        new URL(linkUrl);
      } catch {
        return false;
      }
    }
    return true;
  }, [title, domain, body, mode, linkUrl, domainMatchesExact]);

  useEffect(() => {
    const q = domain.trim();
    if (!q) {
      setDomainResults([]);
      setDomainError(null);
      return;
    }

    const controller = new AbortController();
    setDomainLoading(true);
    setDomainError(null);

    fetch(`/api/domains/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data?.results)) {
          setDomainResults([]);
          return;
        }
        setDomainResults(data.results);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error(err);
        setDomainError("Failed to fetch domain suggestions");
      })
      .finally(() => {
        setDomainLoading(false);
      });

    return () => controller.abort();
  }, [domain]);

  function insertTemplate(template: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = `${body.slice(0, start)}${template}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      const cursor = start + template.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function wrapSelection(before: string, after: string, placeholder: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = body.slice(start, end) || placeholder;
    const next = `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      const cursor = start + before.length + selected.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function submit() {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDomain = domain.trim();
    const trimmedBody = body.trim();

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload: any = {
        title: trimmedTitle,
        domain: trimmedDomain,
        type,
        content: trimmedBody,
        excerpt: trimmedBody.slice(0, 220),
      };

      if (mode === "link") {
        payload.external = linkUrl.trim();
      }

      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || `Failed to post (${res.status})`);

      haptic("success");
      // Most endpoints return the created contribution; fall back to feed.
      const id = json?.contribution?.id || json?.id;
      if (id) {
        if (shareAfterPost && typeof window !== "undefined") {
          const shareUrl = `${window.location.origin}/contribution/${encodeURIComponent(
            String(id),
          )}`;
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => {
              toast({
                title: "Link copied",
                description: "Share the contribution URL with your peers.",
              });
            })
            .catch(() => {
              toast({
                title: "Post created",
                description: "Copy the URL from the address bar to share.",
              });
            });
        }
        navigate(`/contribution/${encodeURIComponent(String(id))}`);
      } else {
        navigate("/feed");
      }
    } catch (e: any) {
      console.error(e);
      haptic("error");
      setError(e?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 lg:pb-10">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Create post
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Serious writing only. Title + domain + clear reasoning.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Couldn’t create post</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="px-4 pt-4">
            <SegmentedControl
              value={mode}
              onChange={(v) => setMode(v as PostMode)}
              options={[
                { value: "text", label: "Text" },
                { value: "link", label: "Link" },
              ]}
            />
          </div>

          {/* Fields */}
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="An accurate, specific title"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                Keep it factual. No hype.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Domain
              </label>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Type a domain (e.g., React)"
                inputMode="search"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {domainResults.slice(0, 12).map((d) => {
                  const selected =
                    d.label.toLowerCase() === domain.trim().toLowerCase();
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        haptic("tap");
                        setDomain(d.label);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border ios-press ios-transition",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/60 text-foreground border-border hover:bg-muted",
                      )}
                      title={d.description || d.label}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {domainLoading && "Searching Wikidata…"}
                {!domainLoading && domainError && domainError}
                {!domainLoading &&
                  !domainError &&
                  domain.trim().length > 1 &&
                  !domainMatchesExact && (
                    <span>
                      No exact domain match found. You can still submit this
                      domain.
                    </span>
                  )}
                {!domainLoading && !domainError && domainMatchesExact && (
                  <span>Exact domain match confirmed.</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Post type
              </label>
              <div className="overflow-x-auto pb-1">
                <SegmentedControl
                  className="min-w-max"
                  value={type}
                  onChange={(v) => setType(v)}
                  options={CONTRIBUTION_TYPES.map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  }))}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                This is not social media. Pick the best category for expert
                review.
              </div>
            </div>

            {mode === "link" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  You still need to write a short explanation below.
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {mode === "link" ? "Your explanation" : "Body"}
              </label>
              <div className="rounded-2xl border border-border bg-background overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border px-3 py-2">
                  <div className="inline-flex rounded-full bg-muted/50 p-1">
                    {(
                      [
                        { key: "write", label: "Write" },
                        { key: "preview", label: "Preview" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setBodyTab(tab.key)}
                        className={cn(
                          "px-3 py-1 text-xs font-semibold rounded-full",
                          bodyTab === tab.key
                            ? "bg-background text-foreground shadow"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {tab.label}
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
                {bodyTab === "write" ? (
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      ref={bodyRef}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      onPaste={(e) => handleMarkdownPaste(e, body, setBody)}
                      rows={10}
                      placeholder={
                        mode === "link"
                          ? "Explain why this link matters. Summarize key points and your reasoning (min 50 chars)."
                          : "Write the full explanation (min 50 chars)."
                      }
                      className={cn(
                        "w-full rounded-none border-0 bg-background pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
                        canResizeBody ? "resize-y" : "resize-none",
                      )}
                    />
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none px-4 py-4 text-foreground"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Minimum 50 characters</span>
                <span>{body.trim().length} chars</span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="text-sm text-muted-foreground hover:text-foreground ios-transition"
            >
              Cancel
            </button>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={shareAfterPost}
                onChange={(e) => setShareAfterPost(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Copy share link after posting
            </label>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || submitting}
              className={cn(
                "rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground ios-press ios-transition",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          By posting, you agree to write honestly and accept peer review.
        </div>
      </main>
    </div>
  );
}
