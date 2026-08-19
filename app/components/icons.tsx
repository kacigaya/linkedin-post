type IconProps = { className?: string };

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM3 8a5 5 0 0 1 .2-1.4l1.3 1.3.9.9v1l.9.9v1.7A5 5 0 0 1 3 8zm7.5 4.6v-.5a1 1 0 0 0-1-1H9v-1.4a.6.6 0 0 0-.6-.6H6.2v-1.2h1a.6.6 0 0 0 .6-.6V6.1h1.1a1 1 0 0 0 1-1v-.8a5 5 0 0 1 .6 8.3z" />
    </svg>
  );
}

export function DotsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

export function VerifiedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        fill="#0a66c2"
        d="M8 0.8 9.7 2l2-.2.9 1.8 1.8.9-.2 2L15.2 8l-1 1.5.2 2-1.8.9-.9 1.8-2-.2L8 15.2 6.5 14l-2 .2-.9-1.8-1.8-.9.2-2L.8 8l1.2-1.5-.2-2 1.8-.9.9-1.8 2 .2z"
      />
      <path fill="#fff" d="M6.9 10.9 4.4 8.4l1-1 1.5 1.5 3.6-3.6 1 1z" />
    </svg>
  );
}

/** The three reaction pills LinkedIn stacks under a post. */
export function LikeReaction({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#378fe9" />
      <path
        fill="#fff"
        d="M4.2 6.9h1.5v5H4.2zM6.4 6.6 8.3 3.3c.3-.5 1.1-.3 1.1.3v2.2h1.9c.6 0 1 .5.9 1l-.6 3.6c-.1.5-.5.8-1 .8H6.4z"
      />
    </svg>
  );
}

export function LoveReaction({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#df704d" />
      <path
        fill="#fff"
        d="M8 12.2 4.6 9c-1-.9-1-2.4-.1-3.3.9-.9 2.3-.8 3.1.1l.4.4.4-.4c.8-.9 2.2-1 3.1-.1.9.9.9 2.4-.1 3.3z"
      />
    </svg>
  );
}

export function InsightReaction({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#f5bb5c" />
      <path
        fill="#fff"
        d="M8 2.6a3.4 3.4 0 0 0-2 6.2c.3.2.5.6.5 1v.3h3v-.3c0-.4.2-.8.5-1a3.4 3.4 0 0 0-2-6.2zM6.5 11.2h3v.8h-3zm.3 1.6h2.4a1.3 1.3 0 0 1-2.4 0z"
      />
    </svg>
  );
}

export function ThumbIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6 10H3v10h3zm2 0 3.2-5.6c.4-.7 1.5-.4 1.5.4V9h3.4c1 0 1.8.9 1.6 1.9l-1 5.7c-.2.8-.9 1.4-1.7 1.4H8z" />
    </svg>
  );
}

export function CommentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.9 3 3 6.5 3 11c0 2.6 1.4 4.9 3.5 6.3V22l4-2.2c.5.1 1 .1 1.5.1 5.1 0 9-3.5 9-8s-3.9-8-9-8zm0 14c-.6 0-1.1 0-1.6-.2l-.5-.1-2 1.1v-2l-.5-.3C5.7 14.5 4.7 12.9 4.7 11 4.7 7.6 8 5 12 5s7.3 2.6 7.3 6-3.3 6-7.3 6z" />
    </svg>
  );
}

export function RepostIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M14 3v2H8.5A3.5 3.5 0 0 0 5 8.5V13H3V8.5A5.5 5.5 0 0 1 8.5 3zm-4 18v-2h5.5a3.5 3.5 0 0 0 3.5-3.5V11h2v4.5a5.5 5.5 0 0 1-5.5 5.5zM4 21l-3-4h6zM20 3l3 4h-6z" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M21 3 2 10.5l6.5 2.6L18 7l-6.2 7 2.7 6.5z" />
    </svg>
  );
}
