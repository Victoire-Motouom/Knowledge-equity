const IMAGE_MARKDOWN = /!\[[^\]]*\]\([^\)]+\)/g;
const IMAGE_HTML = /<img\s+[^>]*>/gi;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

export function sanitizeMarkdown(input: string) {
  return input.replace(IMAGE_MARKDOWN, "").replace(IMAGE_HTML, "");
}

export function sanitizeDomain(input: string) {
  return input.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
}

export function sanitizeText(input: string) {
  return input.replace(CONTROL_CHARS, "").trim();
}
