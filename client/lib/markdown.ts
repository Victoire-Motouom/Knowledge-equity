export const renderMarkdown = (value: string) => {
  const escapeHtml = (input: string) =>
    input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const stripImages = (input: string) =>
    input.replace(/!\[[^\]]*\]\([^\)]+\)/g, "");

  const formatInline = (input: string) => {
    const escaped = escapeHtml(stripImages(input));
    const codeTokens: string[] = [];
    let output = escaped.replace(/`([^`]+)`/g, (_match, code) => {
      const token = `__CODE_${codeTokens.length}__`;
      codeTokens.push(code);
      return token;
    });

    output = output.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    output = output.replace(/_(.*?)_/g, "<em>$1</em>");
    output = output.replace(/~~(.*?)~~/g, "<del>$1</del>");
    output = output.replace(
      /\[(.+?)\]\((https?:\/\/[^\s]+)\)/g,
      '<a class="text-primary underline" href="$2" target="_blank" rel="noreferrer">$1</a>',
    );

    codeTokens.forEach((code, idx) => {
      output = output.replace(
        `__CODE_${idx}__`,
        `<code class="rounded bg-muted px-1">${code}</code>`,
      );
    });

    return output;
  };

  const renderBlock = (block: string) => {
    const lines = block.split("\n");
    const html: string[] = [];
    let listBuffer: string[] = [];
    let orderedBuffer: string[] = [];

    const flushList = () => {
      if (listBuffer.length) {
        html.push(
          `<ul class="list-disc pl-5 space-y-1">${listBuffer.join("")}</ul>`,
        );
        listBuffer = [];
      }
      if (orderedBuffer.length) {
        html.push(
          `<ol class="list-decimal pl-5 space-y-1">${orderedBuffer.join("")}</ol>`,
        );
        orderedBuffer = [];
      }
    };

    for (const line of lines) {
      if (!line.trim()) {
        flushList();
        continue;
      }

      if (/^---$/.test(line.trim())) {
        flushList();
        html.push('<hr class="my-3 border-border" />');
        continue;
      }

      const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
      if (headingMatch) {
        flushList();
        const level = headingMatch[1].length;
        html.push(
          `<h${level} class="mt-3 text-foreground font-semibold">${formatInline(
            headingMatch[2],
          )}</h${level}>`,
        );
        continue;
      }

      const quoteMatch = /^>\s?(.*)$/.exec(line);
      if (quoteMatch) {
        flushList();
        html.push(
          `<blockquote class="border-l-2 border-primary/60 pl-3 text-muted-foreground">${formatInline(
            quoteMatch[1],
          )}</blockquote>`,
        );
        continue;
      }

      const orderedMatch = /^\d+\.\s+(.*)$/.exec(line);
      if (orderedMatch) {
        orderedBuffer.push(`<li>${formatInline(orderedMatch[1])}</li>`);
        continue;
      }

      const listMatch = /^-\s+(.*)$/.exec(line);
      if (listMatch) {
        listBuffer.push(`<li>${formatInline(listMatch[1])}</li>`);
        continue;
      }

      flushList();
      html.push(`<p class="mt-2">${formatInline(line)}</p>`);
    }

    flushList();
    return html.join("");
  };

  const raw = stripImages(value.trim());
  if (!raw) return "";

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
      `<pre class="mt-3 rounded-xl bg-muted/60 p-3 text-xs overflow-x-auto"><code>${code}</code></pre>`,
    );
    lastIndex = match.index + match[0].length;
  }

  const remaining = raw.slice(lastIndex).trim();
  if (remaining) {
    parts.push(renderBlock(remaining));
  }

  return parts.join("");
};
