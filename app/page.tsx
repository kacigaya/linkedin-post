"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { PostCard, type Post } from "./components/PostCard";
import { readAsDataUrl } from "./lib/format";

const LINKEDIN_MAX = 3000;
const MAX_UPLOAD_BYTES = 8_000_000;

const BACKGROUNDS = [
  { id: "none", label: "None", value: "transparent" },
  { id: "grey", label: "Grey", value: "#eef1f4" },
  { id: "blue", label: "Blue", value: "#0a66c2" },
  { id: "ink", label: "Ink", value: "#14171a" },
] as const;

const DEFAULT_POST: Post = {
  name: "Gaya Kaci",
  headline: "Cybersecurity engineer · building small, sharp tools",
  timestamp: "2h",
  body: "I shipped a LinkedIn post generator this weekend.\n\nThe part that annoyed me about every other one: the preview text was locked. Backspace did nothing, line breaks were swallowed.\n\nSo this one is a plain textarea. Type, delete, break lines, paste — it all just works.\n\n#buildinpublic #webdev",
  avatar: null,
  image: null,
  verified: true,
  clamp: false,
  reactions: 428,
  comments: 37,
  reposts: 12,
  theme: "light",
};

export default function Page() {
  const [post, setPost] = useState<Post>(DEFAULT_POST);
  const [background, setBackground] = useState<(typeof BACKGROUNDS)[number]["id"]>("grey");
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends keyof Post>(key: K, value: Post[K]) => {
    setPost((prev) => ({ ...prev, [key]: value }));
  }, []);

  const bg = BACKGROUNDS.find((b) => b.id === background)!;

  const render = useCallback(async (): Promise<Blob | null> => {
    const node = frameRef.current;
    if (!node) return null;
    // Swap the textarea for static markup: a cloned textarea exports empty.
    setExporting(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      // A just-picked image may still be decoding; html-to-image would skip it.
      await Promise.all(
        Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)),
      );
      return await toBlob(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: bg.value === "transparent" ? undefined : bg.value,
      });
    } finally {
      setExporting(false);
    }
  }, [bg.value]);

  async function download() {
    let blob: Blob | null;
    try {
      blob = await render();
    } catch {
      setStatus("Could not render the image — try a smaller attachment");
      return;
    }
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-post.png";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("PNG downloaded");
  }

  async function copy() {
    let blob: Blob | null;
    try {
      blob = await render();
    } catch {
      setStatus("Could not render the image — try a smaller attachment");
      return;
    }
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus("Image copied to clipboard");
    } catch {
      setStatus("Clipboard blocked by the browser — use Download instead");
    }
  }

  async function pick(key: "avatar" | "image", file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("That file is not an image");
      return;
    }
    // Large photos become multi-megabyte data URLs that the export canvas
    // cannot allocate, so refuse them instead of freezing the tab.
    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus(`Image is too large — keep it under ${MAX_UPLOAD_BYTES / 1_000_000} MB`);
      return;
    }
    set(key, await readAsDataUrl(file));
    setStatus(null);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">LinkedIn post generator</h1>
          <p className="mt-1 max-w-prose text-sm text-[var(--color-ink-muted)]">
            Write the post, tweak the details, export a PNG. Everything stays in your browser — no
            upload, no account. The post text is a real textarea, so editing behaves normally.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <form className="order-2 flex flex-col gap-5 lg:order-1" onSubmit={(e) => e.preventDefault()}>
          <Group title="Author">
            <Field label="Name">
              <input
                className={inputClass}
                value={post.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Headline">
              <input
                className={inputClass}
                value={post.headline}
                onChange={(e) => set("headline", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Posted">
                <input
                  className={inputClass}
                  value={post.timestamp}
                  onChange={(e) => set("timestamp", e.target.value)}
                />
              </Field>
              <Field label="Profile photo">
                <FileInput onPick={(f) => pick("avatar", f)} onClear={() => set("avatar", null)} has={!!post.avatar} />
              </Field>
            </div>
            <Toggle
              label="Verified badge"
              checked={post.verified}
              onChange={(v) => set("verified", v)}
            />
          </Group>

          <Group title="Post">
            <Field label={`Text (${post.body.length}/${LINKEDIN_MAX})`}>
              <textarea
                className={`${inputClass} min-h-40 resize-y leading-relaxed`}
                value={post.body}
                maxLength={LINKEDIN_MAX}
                onChange={(e) => set("body", e.target.value)}
              />
            </Field>
            <Field label="Attached image">
              <FileInput onPick={(f) => pick("image", f)} onClear={() => set("image", null)} has={!!post.image} />
            </Field>
            <Toggle
              label="Truncate with “…see more”"
              checked={post.clamp}
              onChange={(v) => set("clamp", v)}
            />
          </Group>

          <Group title="Engagement">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Reactions">
                <NumberInput value={post.reactions} onChange={(v) => set("reactions", v)} />
              </Field>
              <Field label="Comments">
                <NumberInput value={post.comments} onChange={(v) => set("comments", v)} />
              </Field>
              <Field label="Reposts">
                <NumberInput value={post.reposts} onChange={(v) => set("reposts", v)} />
              </Field>
            </div>
          </Group>

          <Group title="Export">
            <Field label="Card theme">
              <Segmented
                value={post.theme}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                onChange={(v) => set("theme", v)}
              />
            </Field>
            <Field label="Backdrop">
              <Segmented
                value={background}
                options={BACKGROUNDS.map((b) => ({ value: b.id, label: b.label }))}
                onChange={setBackground}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={download} className={primaryButton}>
                Download PNG
              </button>
              <button type="button" onClick={copy} className={ghostButton}>
                Copy image
              </button>
              <button
                type="button"
                onClick={() => {
                  setPost(DEFAULT_POST);
                  setStatus("Reset");
                }}
                className={ghostButton}
              >
                Reset
              </button>
            </div>
            <p aria-live="polite" className="min-h-5 text-xs text-[var(--color-ink-muted)]">
              {status}
            </p>
          </Group>
        </form>

        <div className="order-1 lg:order-2 lg:sticky lg:top-8 lg:self-start">
          <div
            ref={frameRef}
            className={`flex justify-center overflow-hidden rounded-lg ${
              bg.value === "transparent" ? "" : "p-6 sm:p-10"
            }`}
            style={{ background: bg.value }}
          >
            <PostCard
              post={post}
              mode={exporting ? "static" : "edit"}
              maxLength={LINKEDIN_MAX}
              onBodyChange={(v) => set("body", v)}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
            Click the post text to edit it directly in the preview.
          </p>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]";
const primaryButton =
  "rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-ink)] hover:opacity-90";
const ghostButton =
  "rounded-md border border-[var(--color-line)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)]";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-ink-muted)]">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      className={inputClass}
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
    />
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-md border border-[var(--color-line)] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium ${
            value === o.value
              ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function FileInput({
  onPick,
  onClear,
  has,
}: {
  onPick: (file: File | undefined) => void;
  onClear: () => void;
  has: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <span className="flex gap-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button type="button" className={`${ghostButton} flex-1 py-1.5 text-xs`} onClick={() => ref.current?.click()}>
        {has ? "Replace" : "Upload"}
      </button>
      {has ? (
        <button
          type="button"
          className={`${ghostButton} py-1.5 text-xs`}
          onClick={() => {
            if (ref.current) ref.current.value = "";
            onClear();
          }}
        >
          Remove
        </button>
      ) : null}
    </span>
  );
}

function ThemeToggle() {
  // Starts false to match the server render; the head script may already have
  // set the class, so read the real value after hydration.
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      type="button"
      className={ghostButton}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try {
          localStorage.setItem("theme", next ? "dark" : "light");
        } catch {}
      }}
    >
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}
