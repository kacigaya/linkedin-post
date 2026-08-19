"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import {
  ChartNoAxesColumn,
  Copy,
  Download,
  ImageDown,
  Moon,
  PenLine,
  RotateCcw,
  Sun,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

const DEFAULT_POST: Post = {
  name: "Gaya Kaci",
  headline: "Cybersecurity engineer · building small, sharp tools",
  timestamp: "2h",
  body: "I shipped a LinkedIn post generator this weekend.\n\nThe part that annoyed me about every other one: the preview text was locked. Backspace did nothing, line breaks were swallowed.\n\nSo this one is a plain textarea. Type, delete, break lines, paste — it all just works.\n\n#buildinpublic #webdev",
  avatar: null,
  avatarShape: "circle",
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
  const [background, setBackground] = useState<BackgroundId>("grey");
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
          <h1 className="font-semibold text-2xl tracking-tight">LinkedIn post generator</h1>
          <p className="mt-1 max-w-prose text-muted-foreground text-sm">
            Write the post, tweak the details, export a PNG. Everything stays in your browser — no
            upload, no account. The post text is a real textarea, so editing behaves normally.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <form className="order-2 flex min-w-0 flex-col gap-4 lg:order-1" onSubmit={(e) => e.preventDefault()}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-muted-foreground" />
                Author
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input value={post.name} onValueChange={(v) => set("name", v)} />
              </Field>
              <Field>
                <FieldLabel>Headline</FieldLabel>
                <Input value={post.headline} onValueChange={(v) => set("headline", v)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Posted</FieldLabel>
                  <Input value={post.timestamp} onValueChange={(v) => set("timestamp", v)} />
                </Field>
                <Field>
                  <FieldLabel>Profile photo</FieldLabel>
                  <FilePicker
                    onPick={(f) => pick("avatar", f)}
                    onClear={() => set("avatar", null)}
                    has={!!post.avatar}
                    label="profile photo"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Photo shape</FieldLabel>
                <Segmented
                  value={post.avatarShape}
                  options={[
                    { value: "circle", label: "Round" },
                    { value: "square", label: "Square" },
                  ]}
                  onChange={(v) => set("avatarShape", v)}
                />
              </Field>
              <CheckboxField
                label="Verified badge"
                checked={post.verified}
                onChange={(v) => set("verified", v)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenLine className="size-4 text-muted-foreground" />
                Post
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel>
                  Text
                  <span className="font-normal text-muted-foreground tabular-nums">
                    {post.body.length}/{LINKEDIN_MAX}
                  </span>
                </FieldLabel>
                <Textarea
                  className="min-h-40"
                  value={post.body}
                  maxLength={LINKEDIN_MAX}
                  onChange={(e) => set("body", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Attached image</FieldLabel>
                <FilePicker
                  onPick={(f) => pick("image", f)}
                  onClear={() => set("image", null)}
                  has={!!post.image}
                  label="attached image"
                />
              </Field>
              <CheckboxField
                label="Truncate with “…see more”"
                checked={post.clamp}
                onChange={(v) => set("clamp", v)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartNoAxesColumn className="size-4 text-muted-foreground" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <Field>
                <FieldLabel>Reactions</FieldLabel>
                <NumberField value={post.reactions} onChange={(v) => set("reactions", v)} />
              </Field>
              <Field>
                <FieldLabel>Comments</FieldLabel>
                <NumberField value={post.comments} onChange={(v) => set("comments", v)} />
              </Field>
              <Field>
                <FieldLabel>Reposts</FieldLabel>
                <NumberField value={post.reposts} onChange={(v) => set("reposts", v)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageDown className="size-4 text-muted-foreground" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Card theme</FieldLabel>
                <Segmented
                  value={post.theme}
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
                  options={BACKGROUNDS.map((b) => ({ value: b.id, label: b.label }))}
                  onChange={setBackground}
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button onClick={download}>
                  <Download />
                  Download PNG
                </Button>
                <Button variant="outline" onClick={copy}>
                  <Copy />
                  Copy image
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPost(DEFAULT_POST);
                    setStatus("Reset");
                  }}
                >
                  <RotateCcw />
                  Reset
                </Button>
              </div>
              <p aria-live="polite" className="min-h-5 text-muted-foreground text-xs">
                {status}
              </p>
            </CardContent>
          </Card>
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
          <p className="mt-3 text-muted-foreground text-xs">
            Click the post text to edit it directly in the preview.
          </p>
        </div>
      </div>
    </main>
  );
}

function NumberField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      min={0}
      inputMode="numeric"
      value={String(value)}
      onValueChange={(v) => onChange(Math.max(0, Number(v) || 0))}
    />
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
      <FieldLabel className="gap-2.5">
        <Checkbox checked={checked} onCheckedChange={onChange} />
        {label}
      </FieldLabel>
    </Field>
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
    <ToggleGroup
      className="w-full"
      variant="outline"
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
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          // Let the same file be picked again after a Remove.
          e.target.value = "";
        }}
      />
      <Button className="flex-1" variant="outline" size="sm" onClick={() => ref.current?.click()}>
        <Upload />
        {has ? "Replace" : "Upload"}
      </Button>
      {has ? (
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${label}`} onClick={onClear}>
          <X />
        </Button>
      ) : null}
    </div>
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
    <Button
      variant="outline"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try {
          localStorage.setItem("theme", next ? "dark" : "light");
        } catch {}
      }}
    >
      {dark ? <Sun /> : <Moon />}
      {dark ? "Light mode" : "Dark mode"}
    </Button>
  );
}
