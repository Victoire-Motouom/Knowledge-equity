type PasteContext = {
  listType?: "ul" | "ol";
  orderIndex?: number;
};

const TEXT_TAGS = new Set(["strong", "b", "em", "i", "del", "s", "code", "a"]);

const joinLines = (lines: string[]) =>
  lines
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

const collectChildren = (el: HTMLElement, ctx: PasteContext): string =>
  Array.from(el.childNodes)
    .map((child) => nodeToMarkdown(child, ctx))
    .join("");

const nodeToMarkdown = (node: Node, ctx: PasteContext = {}): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === "img") return "";

  if (tag === "br") return "\n";

  if (tag === "strong" || tag === "b") {
    return `**${collectChildren(el, ctx)}**`;
  }

  if (tag === "em" || tag === "i") {
    return `_${collectChildren(el, ctx)}_`;
  }

  if (tag === "del" || tag === "s") {
    return `~~${collectChildren(el, ctx)}~~`;
  }

  if (tag === "code" && el.parentElement?.tagName.toLowerCase() !== "pre") {
    return `\`${collectChildren(el, ctx)}\``;
  }

  if (tag === "pre") {
    const code = el.textContent ?? "";
    return `\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`;
  }

  if (tag === "a") {
    const href = el.getAttribute("href") || "";
    const label = collectChildren(el, ctx) || href;
    return href ? `[${label}](${href})` : label;
  }

  if (tag === "blockquote") {
    const content = collectChildren(el, ctx);
    const lines = content.split("\n").map((line) => `> ${line}`);
    return `\n\n${joinLines(lines)}\n\n`;
  }

  if (tag === "ul" || tag === "ol") {
    const isOrdered = tag === "ol";
    const items = Array.from(el.children).filter(
      (child) => child.tagName.toLowerCase() === "li",
    );
    const lines = items.map((child, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : "- ";
      let content = "";
      Array.from(child.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          content += collectChildren(child, { listType: tag as any });
        }
      });
      return `${prefix}${content}`;
    });
    return `\n${joinLines(lines)}\n`;
  }

  if (tag === "li") {
    return normalizeWhitespace(collectChildren(el, ctx));
  }

  if (/^h[1-3]$/.test(tag)) {
    const level = Number(tag.slice(1));
    return `\n\n${"#".repeat(level)} ${normalizeWhitespace(collectChildren(el, ctx))}\n\n`;
  }

  if (tag === "p" || tag === "div") {
    const content = normalizeWhitespace(collectChildren(el, ctx));
    return content ? `\n\n${content}\n\n` : "";
  }

  if (TEXT_TAGS.has(tag)) {
    return collectChildren(el, ctx);
  }

  return collectChildren(el, ctx);
};

export const htmlToMarkdown = (html: string) => {
  if (typeof window === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const markdown = Array.from(body.childNodes)
    .map((node) => nodeToMarkdown(node))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return markdown;
};

export const handleMarkdownPaste = (
  event: React.ClipboardEvent<HTMLTextAreaElement>,
  value: string,
  setValue: (next: string) => void,
) => {
  const html = event.clipboardData?.getData("text/html");
  if (!html) return;

  const markdown = htmlToMarkdown(html);
  if (!markdown) return;

  const plain = event.clipboardData?.getData("text/plain") ?? "";
  if (normalizeWhitespace(markdown) === normalizeWhitespace(plain)) return;

  event.preventDefault();
  const target = event.target as HTMLTextAreaElement;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? 0;
  const next = `${value.slice(0, start)}${markdown}${value.slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    const cursor = start + markdown.length;
    target.focus();
    target.setSelectionRange(cursor, cursor);
  });
};
