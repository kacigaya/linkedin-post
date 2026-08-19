/** LinkedIn shows raw counts up to 999 and then a compact form (1,234 -> 1K). */
export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  const n = Math.floor(value);
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (n < 1_000_000) return `${Math.floor(n / 1000)}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => [...p][0]!.toUpperCase()).join("");
}

export type Segment = { text: string; kind: "text" | "tag" };

/** Splits post text so hashtags and @mentions can be rendered in link blue. */
export function segments(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /[#@][\p{L}\p{N}_-]+/gu;
  let last = 0;
  for (const match of text.matchAll(re)) {
    const start = match.index;
    if (start > last) out.push({ text: text.slice(last, start), kind: "text" });
    out.push({ text: match[0], kind: "tag" });
    last = start + match[0].length;
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
