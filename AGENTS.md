# linkedin-post

LinkedIn post mockup generator. Next.js App Router, React 19, Tailwind 4, Bun,
Coss UI (Base UI) for the control panel. Entirely client-side: no API routes, no
database, no environment variables.

Design system, fonts, theming, and README structure mirror
`/home/ubuntu/projects/muzik` (`kacigaya/muzik`). Check that repo before
changing tokens or chrome.

## Commands

```sh
bun install
bun run dev        # next dev on :3000
bun run build      # standalone output in .next/standalone
bun run typecheck
bun run check      # typecheck + build; run this before shipping
```

Bun 1.3.14, Node 24.

## Deployment

- Public host: `linkedin.gayakaci.duckdns.org` (DuckDNS wildcard, no DNS work needed).
- Dokploy Application, source type `git` on `kacigaya/linkedin-post`, build type
  `dockerfile`, container port 3000.
- Dokploy domain entry must stay `certificateType: none` and `https: false`;
  Caddy owns TLS. See `/home/ubuntu/DOKPLOY.md` on the host.
- Pushes to `main` trigger a Dokploy rebuild through the hooks endpoint.

## UI

- Panel components live in `components/ui`, added with
  `bunx --bun shadcn@latest add @coss/<name>` (registry in `components.json`).
  They are owned in-repo — edit them directly rather than wrapping them.
- Semantic tokens live at the top of `app/globals.css`: coss's neutral set
  shifted to the stone scale in light and to `#161616` / `#1b1b1b` in dark,
  copied from Muzik. `--brand` tracks `--primary`.
- Fonts are Inter and Geist Mono through `next/font/google`, so the Docker build
  needs network access. The post card overrides them with the system stack.
- Theming is `next-themes` (`attribute="class"`, system default). Anything
  derived from `resolvedTheme` must wait for a mounted flag, and the theme icons
  swap in CSS — deriving markup from it directly breaks hydration.
- `SiteNav` is Muzik's top bar: one rounded-xl `bg-card/80` strip, `max-w-6xl`.
- `.li-card` in `app/globals.css` is a separate, fixed palette for the post card.
  Keep it independent of the app theme so exports stay deterministic.

## Constraints worth keeping

- `next.config.ts` sets `output: "standalone"`; the Dockerfile runner copies
  `.next/standalone` and `.next/static`. Removing it breaks the image.
- The post body is a `<textarea>` on purpose. Do not replace it with
  `contenteditable` — free editing is the feature.
- The post card is fluid (`w-full max-w-[552px]`). Giving it a fixed width sets
  the mobile grid track and pushes the whole page into horizontal scroll; its
  narrow-width tweaks use container queries, not viewport breakpoints.
- Export `pixelRatio` scales with the rendered card width so a phone export is
  still roughly desktop-sized. The exported layout is whatever is on screen.
- Tagged names are plain substrings, matched case-insensitively and
  longest-first in `segments()`. LinkedIn stores mentions as links, not syntax,
  so there is no marker to parse out of the body.
- The editor's highlight overlay must keep the same text metrics as the
  textarea it sits under, so it never bolds a tag. Changing that reintroduces
  caret drift.
- `PostCard` renders `mode="static"` during export because html-to-image clones
  textareas without their value.
- The post card sets the system sans stack inline. It must not inherit Inter,
  or the export stops matching what LinkedIn renders.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
