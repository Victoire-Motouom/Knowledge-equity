const EMOJIS = [
  "🧠",
  "📚",
  "🔬",
  "🛰️",
  "🧩",
  "🧪",
  "🧭",
  "🪐",
  "🧵",
  "🗺️",
  "🪶",
  "🧰",
  "📡",
  "🧷",
  "🪞",
  "🔍",
  "🧊",
  "🪵",
  "🪄",
  "🧬",
  "📝",
  "📎",
  "📌",
  "🔗",
  "🧿",
  "📈",
  "🪙",
  "🪡",
  "🗜️",
  "🧯",
];

export function emojiForHandle(handle?: string | null) {
  const seed = (handle || "user").toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  return EMOJIS[Math.abs(hash) % EMOJIS.length];
}
