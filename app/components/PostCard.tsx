"use client";

import { useEffect, useRef } from "react";
import {
  CommentIcon,
  DotsIcon,
  GlobeIcon,
  InsightReaction,
  LikeReaction,
  LoveReaction,
  RepostIcon,
  SendIcon,
  ThumbIcon,
  VerifiedIcon,
} from "./icons";
import { formatCount, initials, segments } from "../lib/format";

export type Post = {
  name: string;
  headline: string;
  timestamp: string;
  body: string;
  avatar: string | null;
  image: string | null;
  verified: boolean;
  clamp: boolean;
  reactions: number;
  comments: number;
  reposts: number;
  theme: "light" | "dark";
};

type Props = {
  post: Post;
  /** "static" swaps the body textarea for plain markup so PNG export captures the text. */
  mode: "edit" | "static";
  maxLength: number;
  onBodyChange: (value: string) => void;
};

export function PostCard({ post, mode, maxLength, onBodyChange }: Props) {
  const bodyStyle = "text-[14px] leading-[20px] whitespace-pre-wrap break-words";

  return (
    <article
      className="li-card @container w-full max-w-[552px] overflow-hidden rounded-lg border text-left"
      data-theme={post.theme}
      style={{
        background: "var(--li-bg)",
        borderColor: "var(--li-line)",
        color: "var(--li-text)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <header className="flex items-start gap-2 px-4 pt-3">
        <Avatar post={post} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[14px] font-semibold leading-[20px]">
              {post.name || "Your name"}
            </span>
            {post.verified ? <VerifiedIcon className="h-[14px] w-[14px] shrink-0" /> : null}
          </div>
          <p className="truncate text-[12px] leading-[16px]" style={{ color: "var(--li-muted)" }}>
            {post.headline}
          </p>
          <p
            className="flex items-center gap-1 text-[12px] leading-[16px]"
            style={{ color: "var(--li-muted)" }}
          >
            <span>{post.timestamp}</span>
            <span aria-hidden="true">·</span>
            <GlobeIcon className="h-3 w-3" />
          </p>
        </div>
        <span className="mt-1 shrink-0" style={{ color: "var(--li-muted)" }} aria-hidden="true">
          <DotsIcon className="h-4 w-4" />
        </span>
      </header>

      <div className="px-4 pb-3 pt-2">
        {mode === "edit" ? (
          <BodyEditor
            value={post.body}
            onChange={onBodyChange}
            maxLength={maxLength}
            clamp={post.clamp}
            className={bodyStyle}
          />
        ) : (
          <p className={`${bodyStyle} ${post.clamp ? "line-clamp-3" : ""}`}>
            {segments(post.body).map((seg, i) =>
              seg.kind === "tag" ? (
                <span key={i} style={{ color: "var(--li-link)", fontWeight: 600 }}>
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        )}
        {post.clamp && mode === "static" ? (
          <button
            type="button"
            className="mt-0.5 text-[14px]"
            style={{ color: "var(--li-muted)" }}
            tabIndex={-1}
          >
            …see more
          </button>
        ) : null}
      </div>

      {post.image ? (
        // Uploaded images are data URLs; next/image would proxy them for nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="block w-full" />
      ) : null}

      <div
        className="mx-4 flex flex-wrap items-center justify-between gap-x-2 border-b py-1.5 text-[12px]"
        style={{ borderColor: "var(--li-line)", color: "var(--li-muted)" }}
      >
        <span className="flex items-center gap-1">
          <span className="flex -space-x-0.5">
            <LikeReaction className="h-4 w-4" />
            <LoveReaction className="h-4 w-4" />
            <InsightReaction className="h-4 w-4" />
          </span>
          <span>{formatCount(post.reactions)}</span>
        </span>
        <span className="flex gap-2">
          <span>{formatCount(post.comments)} comments</span>
          <span aria-hidden="true">·</span>
          <span>{formatCount(post.reposts)} reposts</span>
        </span>
      </div>

      <div className="flex items-center justify-between px-2 py-1">
        <Action icon={<ThumbIcon className="h-5 w-5" />} label="Like" />
        <Action icon={<CommentIcon className="h-5 w-5" />} label="Comment" />
        <Action icon={<RepostIcon className="h-5 w-5" />} label="Repost" />
        <Action icon={<SendIcon className="h-5 w-5" />} label="Send" />
      </div>
    </article>
  );
}

function Avatar({ post }: { post: Post }) {
  if (post.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={post.avatar}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[16px] font-semibold text-white"
      style={{ background: "#0a66c2" }}
    >
      {initials(post.name)}
    </div>
  );
}

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-2 text-[14px] font-semibold"
      style={{ color: "var(--li-muted)" }}
    >
      {icon}
      {/* LinkedIn drops these labels on a narrow feed; a container query keeps
          the decision tied to the card, not the viewport. */}
      <span className="hidden @[24rem]:inline">{label}</span>
    </span>
  );
}

/** Plain textarea: Backspace, Delete, Enter and IME input all behave natively. */
function BodyEditor({
  value,
  onChange,
  maxLength,
  clamp,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  clamp: boolean;
  className: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // Three lines of 20px matches the line-clamp the export applies, so the
    // editor never shows more text than the PNG will.
    el.style.height = clamp ? `${Math.min(el.scrollHeight, 60)}px` : `${el.scrollHeight}px`;
  }, [value, clamp]);

  return (
    <textarea
      ref={ref}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Post text"
      spellCheck={false}
      className={`${className} block w-full resize-none overflow-hidden rounded-sm bg-transparent p-0 outline-none`}
      style={{ color: "var(--li-text)", fontFamily: "inherit" }}
    />
  );
}
