"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AtSign,
  ChartNoAxesColumn,
  Copy,
  Download,
  ImageDown,
  PenLine,
  Plus,
  RotateCcw,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PostCard, type Post } from "./components/PostCard";
import { readAsDataUrl } from "./lib/format";
import { applyDemo, INITIAL_EXAMPLES, isPostDirty, selectExamples } from "./lib/examples";

const LINKEDIN_MAX = 3000;
const MAX_UPLOAD_BYTES = 8_000_000;

const BACKGROUNDS = [
  { id: "none", label: "None", value: "transparent" },
  { id: "grey", label: "Grey", value: "#eef1f4" },
  { id: "blue", label: "Blue", value: "#0a66c2" },
  { id: "ink", label: "Ink", value: "#14171a" },
] as const;

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

const DEFAULT_POST = INITIAL_EXAMPLES.post;

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1200, height: 630 });
    img.src = src;
  });
}

export default function Page() {
  const [post, setPost] = useState<Post>(DEFAULT_POST);
  const [baseline, setBaseline] = useState(DEFAULT_POST);
  const [placeholders, setPlaceholders] = useState(INITIAL_EXAMPLES.placeholders);
  const initialized = useRef(false);
  const [background, setBackground] = useState<BackgroundId>("grey");
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends keyof Post>(key: K, value: Post[K]) => {
    setPost((prev) => ({ ...prev, [key]: value }));
  }, []);

  const bg = BACKGROUNDS.find((b) => b.id === background)!;

  // Warn before navigating away if the user made modifications.
  const isDirty = isPostDirty(post, baseline);
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Randomize only after hydration; keep one selection through Strict Mode replay.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const examples = selectExamples();
    const params = new URLSearchParams(window.location.search);
    const bgParam = params.get("bg");
    if (bgParam && BACKGROUNDS.some((b) => b.id === bgParam)) {
      setBackground(bgParam as BackgroundId);
    }
    const themeParam = params.get("theme");
    if (themeParam === "light" || themeParam === "dark") {
      examples.post.theme = themeParam;
    }
    setBaseline(examples.post);
    setPlaceholders(examples.placeholders);
    setPost((prev) => applyDemo(prev, DEFAULT_POST, examples.post));
  }, []);

  // Keep stateful UI in sync with URL search params.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (background !== "grey") {
      url.searchParams.set("bg", background);
    } else {
      url.searchParams.delete("bg");
    }
    if (post.theme !== "light") {
      url.searchParams.set("theme", post.theme);
    } else {
      url.searchParams.delete("theme");
    }
    const search = url.searchParams.toString();
    const newRelativePath = search ? `${url.pathname}?${search}` : url.pathname;
    if (window.location.search !== (search ? `?${search}` : "")) {
      window.history.replaceState(null, "", newRelativePath);
    }
  }, [background, post.theme]);

  const render = useCallback(async (): Promise<Blob | null> => {
    const node = frameRef.current;
    if (!node) return null;
    // Export is an optional path. Keep its renderer out of the initial bundle.
    const { toBlob } = await import("html-to-image");
    // Swap the textarea for static markup: a cloned textarea exports empty.
    setExporting(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      // A just-picked image may still be decoding; html-to-image would skip it.
      await Promise.all(
        Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)),
      );
      return await toBlob(node, {
        // The card is fluid, so scale the capture to land near a desktop-width
        // PNG instead of exporting a phone-sized image.
        pixelRatio: Math.min(4, Math.max(2, 1200 / node.offsetWidth)),
        cacheBust: true,
        backgroundColor: bg.value === "transparent" ? undefined : bg.value,
      });
    } finally {
      setExporting(false);
    }
  }, [bg.value]);

  async function download() {
    setStatus("Rendering PNG…");
    let blob: Blob | null;
    try {
      blob = await render();
    } catch {
      setStatus("Could not render the image. Try a smaller attachment.");
      return;
    }
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-post.png";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Saved as linkedin-post.png.");
  }

  async function copy() {
    setStatus("Rendering PNG…");
    let blob: Blob | null;
    try {
      blob = await render();
    } catch {
      setStatus("Could not render the image. Try a smaller attachment.");
      return;
    }
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatus("Copied to the clipboard.");
    } catch {
      setStatus("The browser blocked the clipboard. Use Download instead.");
    }
  }

  async function pick(key: "avatar" | "image", file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("That file is not an image. Pick a PNG or JPEG file instead.");
      return;
    }
    // Large photos become multi-megabyte data URLs that the export canvas
    // cannot allocate, so refuse them instead of freezing the tab.
    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus(`That image is over ${MAX_UPLOAD_BYTES / 1_000_000}\u00a0MB. Pick a smaller one.`);
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    if (key === "image") {
      const dims = await getImageDimensions(dataUrl);
      setPost((prev) => ({
        ...prev,
        image: dataUrl,
        imageWidth: dims.width,
        imageHeight: dims.height,
      }));
    } else {
      set("avatar", dataUrl);
    }
    setStatus(null);
  }

  return (
    <main id="main" className="mx-auto w-full max-w-6xl scroll-mt-4 px-4 py-8 sm:px-8">
      <div className="mb-8">
        <h1 className="font-heading font-semibold text-2xl tracking-tight text-balance">
          Write the Post, Download the Picture
        </h1>
        <p className="mt-1 max-w-prose text-muted-foreground text-pretty text-sm">
          Nothing is uploaded and there is no account. The post text is a real textarea, so
          Backspace, Enter and paste work the way they do everywhere else.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <form className="order-2 flex min-w-0 flex-col gap-10 lg:order-1" onSubmit={(e) => e.preventDefault()}>
          <section className="flex flex-col gap-4">
            <h2 id="author" className="flex scroll-mt-6 items-center gap-2 font-extrabold text-lg tracking-tight text-balance">
              <UserRound aria-hidden="true" className="size-4.5 text-muted-foreground" />
              Author
            </h2>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                name="author-name"
                autoComplete="off"
                placeholder={placeholders.name}
                value={post.name}
                onValueChange={(v) => set("name", v)}
              />
            </Field>
            <Field>
              <FieldLabel>Headline</FieldLabel>
              <Input
                name="author-headline"
                autoComplete="off"
                placeholder={placeholders.headline}
                value={post.headline}
                onValueChange={(v) => set("headline", v)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Posted</FieldLabel>
                <Input
                  name="posted"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={placeholders.timestamp}
                  value={post.timestamp}
                  onValueChange={(v) => set("timestamp", v)}
                />
              </Field>
              <Field>
                <FieldLabel>Profile Photo</FieldLabel>
                <FilePicker
                  onPick={(f) => pick("avatar", f)}
                  onClear={() => set("avatar", null)}
                  has={!!post.avatar}
                  label="profile photo"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Photo Shape</FieldLabel>
              <Segmented
                value={post.avatarShape}
                ariaLabel="Photo shape"
                options={[
                  { value: "circle", label: "Round" },
                  { value: "square", label: "Square" },
                ]}
                onChange={(v) => set("avatarShape", v)}
              />
            </Field>
            <CheckboxField
              label="Verified Badge"
              checked={post.verified}
              onChange={(v) => set("verified", v)}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="post" className="flex scroll-mt-6 items-center gap-2 font-extrabold text-lg tracking-tight text-balance">
              <PenLine aria-hidden="true" className="size-4.5 text-muted-foreground" />
              Post
            </h2>
            <Field>
              <FieldLabel>
                Text
                <span className="font-normal text-muted-foreground tabular-nums">
                  {post.body.length}/{LINKEDIN_MAX}
                </span>
              </FieldLabel>
              <Textarea
                className="min-h-40"
                name="post-body"
                autoComplete="off"
                placeholder={placeholders.body}
                value={post.body}
                maxLength={LINKEDIN_MAX}
                onChange={(e) => set("body", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Attached Image</FieldLabel>
              <FilePicker
                onPick={(f) => pick("image", f)}
                onClear={() =>
                  setPost((prev) => ({
                    ...prev,
                    image: null,
                    imageWidth: undefined,
                    imageHeight: undefined,
                  }))
                }
                has={!!post.image}
                label="attached image"
              />
            </Field>
            <MentionsField
              placeholder={placeholders.mention}
              mentions={post.mentions}
              onChange={(next) => set("mentions", next)}
              onDuplicate={(name) => setStatus(`“${name}” is already tagged.`)}
            />
            <CheckboxField
              label={'Truncate with \u201c\u2026see more\u201d'}
              checked={post.clamp}
              onChange={(v) => set("clamp", v)}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="engagement" className="flex scroll-mt-6 items-center gap-2 font-extrabold text-lg tracking-tight text-balance">
              <ChartNoAxesColumn aria-hidden="true" className="size-4.5 text-muted-foreground" />
              Engagement
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <Field>
                <FieldLabel>Reactions</FieldLabel>
                <NumberField name="reactions" value={post.reactions} onChange={(v) => set("reactions", v)} />
              </Field>
              <Field>
                <FieldLabel>Comments</FieldLabel>
                <NumberField name="comments" value={post.comments} onChange={(v) => set("comments", v)} />
              </Field>
              <Field>
                <FieldLabel>Reposts</FieldLabel>
                <NumberField name="reposts" value={post.reposts} onChange={(v) => set("reposts", v)} />
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 id="export" className="flex scroll-mt-6 items-center gap-2 font-extrabold text-lg tracking-tight text-balance">
              <ImageDown aria-hidden="true" className="size-4.5 text-muted-foreground" />
              Export
            </h2>
            <Field>
              <FieldLabel>Card Theme</FieldLabel>
              <Segmented
                value={post.theme}
                ariaLabel="Card theme"
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                onChange={(v) => set("theme", v)}
              />
            </Field>
            <Field>
              <FieldLabel>Backdrop</FieldLabel>
              <Segmented
                value={background}
                ariaLabel="Backdrop"
                options={BACKGROUNDS.map((b) => ({ value: b.id, label: b.label }))}
                onChange={setBackground}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button onClick={download} loading={exporting}>
                <Download aria-hidden="true" />
                Download PNG
              </Button>
              <Button variant="outline" onClick={copy} loading={exporting}>
                <Copy aria-hidden="true" />
                Copy Image
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!window.confirm("Reset everything back to the defaults?")) return;
                  setPost(baseline);
                  setStatus("Back to the defaults.");
                }}
              >
                <RotateCcw aria-hidden="true" />
                Reset
              </Button>
            </div>
            <p aria-live="polite" className="min-h-5 text-muted-foreground text-xs">
              {status}
            </p>
          </section>
        </form>

        <div className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-8 lg:self-start">
          <div
            ref={frameRef}
            className={`flex justify-center overflow-hidden rounded-2xl ${
              bg.value === "transparent" ? "" : "p-4 sm:p-10"
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
          <p className="mt-3 text-muted-foreground text-pretty text-xs">
            Click the post text to edit it here.
          </p>
        </div>
      </div>
    </main>
  );
}

function NumberField({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (v: number) => void;
  name: string;
}) {
  return (
    <Input
      type="number"
      name={name}
      autoComplete="off"
      spellCheck={false}
      placeholder="0…"
      className="tabular-nums"
      min={0}
      inputMode="numeric"
      value={String(value)}
      onValueChange={(v) => onChange(Math.max(0, Number(v) || 0))}
    />
  );
}

function MentionsField({
  placeholder,
  mentions,
  onChange,
  onDuplicate,
}: {
  placeholder: string;
  mentions: string[];
  onChange: (next: string[]) => void;
  onDuplicate: (name: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const name = draft.trim();
    if (!name) return;
    if (mentions.some((m) => m.toLowerCase() === name.toLowerCase())) {
      onDuplicate(name);
      return;
    }
    onChange([...mentions, name]);
    setDraft("");
  }

  return (
    <Field>
      <FieldLabel>
        <AtSign aria-hidden="true" className="size-3.5 text-muted-foreground" />
        Tagged People &amp; Pages
      </FieldLabel>
      <div className="flex w-full gap-2">
        <Input
          value={draft}
          name="mention-draft"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          onValueChange={setDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="outline" size="icon" aria-label="Add tagged name" onClick={add}>
          <Plus aria-hidden="true" />
        </Button>
      </div>
      {mentions.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {mentions.map((name) => (
            <li key={name} className="min-w-0 max-w-full">
              <Badge variant="secondary" size="lg" className="max-w-full gap-1 pe-0.5">
                <span className="min-w-0 truncate">{name}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${name}`}
                  onClick={() => onChange(mentions.filter((m) => m !== name))}
                >
                  <X aria-hidden="true" />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      <FieldDescription>
        Each name is highlighted wherever it appears in the post, the way <span translate="no">LinkedIn</span> draws a tag.
      </FieldDescription>
    </Field>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Field>
      <FieldLabel className="cursor-pointer gap-2.5 select-none">
        <Checkbox checked={checked} onCheckedChange={onChange} aria-label={label} />
        {label}
      </FieldLabel>
    </Field>
  );
}

function Segmented<T extends string>({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  ariaLabel?: string;
  onChange: (v: T) => void;
}) {
  return (
    <ToggleGroup
      className="w-full"
      variant="outline"
      aria-label={ariaLabel}
      value={[value]}
      onValueChange={(next) => {
        // Base UI hands back an array; ignore the empty one so a segment is
        // always selected.
        const picked = next[0] as T | undefined;
        if (picked) onChange(picked);
      }}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} className="flex-1" value={o.value}>
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function FilePicker({
  onPick,
  onClear,
  has,
  label,
}: {
  onPick: (file: File | undefined) => void;
  onClear: () => void;
  has: boolean;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex w-full gap-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        aria-label={`Upload ${label}`}
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          // Let the same file be picked again after a Remove.
          e.target.value = "";
        }}
      />
      <Button className="flex-1" variant="outline" onClick={() => ref.current?.click()}>
        <Upload aria-hidden="true" />
        {has ? "Replace" : "Upload"}
      </Button>
      {has ? (
        <Button variant="ghost" size="icon" aria-label={`Remove ${label}`} onClick={onClear}>
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
