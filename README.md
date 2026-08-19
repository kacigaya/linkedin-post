# linkedin-post

Design a LinkedIn post mockup in the browser and export it as a PNG.

Live at [linkedin.gayakaci.duckdns.org](https://linkedin.gayakaci.duckdns.org).

The post text is a plain `<textarea>`, not a `contenteditable` div. Backspace,
Delete, Enter, paste, undo, and IME input all behave the way the browser
intended — which is the one thing most generators of this kind get wrong.

## What it does

- Edit the post body inline in the preview, or in the form on the left.
- Set name, headline, timestamp, verified badge, and profile photo.
- Switch the photo between round (member) and square (company page).
- Attach an image to the post.
- Fake the reaction, comment, and repost counts.
- Switch the card between LinkedIn's light and dark themes.
- Frame the card on a backdrop, then download the PNG or copy it to the clipboard.

Uploaded photos are read as data URLs and never leave the page. There is no
backend, no account, and no analytics.

## Development

```sh
bun install
bun run dev        # http://localhost:3000
bun run check      # typecheck + build
```

Requires Bun 1.3 and Node 24.

## Layout

| Path | Contents |
| --- | --- |
| `app/page.tsx` | Editor state, control panel, PNG export |
| `app/components/PostCard.tsx` | The card that gets rendered to PNG |
| `app/components/icons.tsx` | The verified badge and reaction pills (no lucide equivalent) |
| `app/lib/format.ts` | Count formatting, hashtag splitting, file reading |
| `components/ui/*` | [Coss UI](https://coss.com/ui) components, owned in-repo |

The control panel is built from Coss UI (Base UI + Tailwind), installed through
the shadcn CLI against the `@coss` registry declared in `components.json`:

```sh
bunx --bun shadcn@latest add @coss/button @coss/input @coss/textarea
```

The post card itself deliberately does **not** use them. It carries LinkedIn's
own palette and type scale in `.li-card`, so the exported PNG never inherits the
app theme.

Export goes through [`html-to-image`](https://github.com/bubkoo/html-to-image).
Because a cloned `<textarea>` serializes without its value, the card swaps the
editor for static markup for the duration of the capture — that is what
`mode="static"` in `PostCard` is for.

## Deployment

Dockerfile build on Dokploy, Next.js standalone output on container port 3000,
fronted by Caddy. See `AGENTS.md`.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).
