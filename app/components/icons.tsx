// LinkedIn-specific marks that lucide has no equivalent for: the verified
// badge and the three colored reaction pills. Everything else in the card
// comes from lucide-react.
type IconProps = { className?: string };

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
