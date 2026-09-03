/** LinkedIn shows raw counts up to 999 and then a compact form (1,234 -> 1.2K). */
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const n = Math.floor(value);
  if (n < 1000) return String(n);
  return compact.format(n);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => [...p][0]!.toUpperCase()).join("");
}

export type Segment = { text: string; kind: "text" | "tag" | "mention" };

type Match = { start: number; end: number; kind: "tag" | "mention" };

/**
 * Splits post text into plain runs, hashtags, and tagged people or pages.
 *
 * LinkedIn stores a mention as a link, not as syntax, so a tagged name is just
 * ordinary words in the post body. Callers pass the names they tagged and every
 * occurrence of each one is highlighted, longest name first so that "Micro Club
 * usthb" wins over a "Micro Club" tagged separately.
 */
export function segments(text: string, mentions: readonly string[] = []): Segment[] {
  const matches: Match[] = [];

  const names = [...new Set(mentions.map((m) => m.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  const haystack = text.toLowerCase();
  for (const name of names) {
    const needle = name.toLowerCase();
    for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, i + 1)) {
      matches.push({ start: i, end: i + needle.length, kind: "mention" });
    }
  }

  for (const match of text.matchAll(/[#@][\p{L}\p{N}_-]+/gu)) {
    matches.push({ start: match.index, end: match.index + match[0].length, kind: "tag" });
  }

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const out: Segment[] = [];
  let last = 0;
  for (const match of matches) {
    if (match.start < last) continue; // overlapped by an earlier, longer match
    if (match.start > last) out.push({ text: text.slice(last, match.start), kind: "text" });
    out.push({ text: text.slice(match.start, match.end), kind: match.kind });
    last = match.end;
  }
  if (last < text.length) out.push({ text: text.slice(last), kind: "text" });
  return out;
}

/** Reads a picked file as a data URL so nothing leaves the browser. */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
