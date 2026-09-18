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
bun run dev        # next dev on :3000, served under /linkedin-post/
bun run build      # static export in out/
bun run typecheck
bun run check      # typecheck + test + build; run this before shipping
```

Bun 1.3.14, Node 24.

## Deployment

- Public URL: `https://kacigaya.github.io/linkedin-post/`. `app/site.ts`
  holds it as `SITE_URL` for sitemap and canonical/OG URLs.
- GitHub Pages, deployed by `.github/workflows/pages.yml` on push to `main`:
  `bun run check`, upload `out/`, `actions/deploy-pages`. Pages source in the
  repo settings must be "GitHub Actions", not a branch.
- No server, no Docker, no Dokploy. The old `linkedin.gayakaci.duckdns.org`
  host is retired.
- Pages sets no response headers. The CSP is a `<meta http-equiv>` in
  `app/layout.tsx`; `frame-ancestors`, `X-Content-Type-Options`, and
  `Permissions-Policy` cannot be expressed that way and are gone.

## UI

- Panel components live in `components/ui`, added with
  `bunx --bun shadcn@latest add @coss/<name>` (registry in `components.json`).
  They are owned in-repo — edit them directly rather than wrapping them.
- Semantic tokens live at the top of `app/globals.css`: coss's neutral set
  shifted to the stone scale in light and to `#161616` / `#1b1b1b` in dark,
  copied from Muzik. `--brand` tracks `--primary`.
- Fonts are Inter and Geist Mono through `next/font/google`, so the build
  needs network access. The post card overrides them with the system stack.
- Theming is `next-themes` (`attribute="class"`, system default). Anything
  derived from `resolvedTheme` must wait for a mounted flag, and the theme icons
  swap in CSS — deriving markup from it directly breaks hydration.
- `SiteNav` is Muzik's top bar: one rounded-xl `bg-card/80` strip, `max-w-6xl`.
- `.li-card` in `app/globals.css` is a separate, fixed palette for the post card.
  Keep it independent of the app theme so exports stay deterministic.

## Constraints worth keeping

- `next.config.ts` sets `output: "export"`, `basePath: "/linkedin-post"`, and
  `trailingSlash: true`. No API routes, server actions, `next/image`,
  `headers()`, or middleware: the export build rejects them. `sitemap.ts` needs
  `dynamic = "force-static"`.
- `basePath` is applied by `next/link` and static asset imports, not by raw
  `<a href="/x">` or `<img src="/x">`. Use `Link` and `import icon from
  "@/public/icon.svg"` for anything that points inside the site.
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

## Privacy pages

- Hosting is GitHub Pages as of 2026-09-18; the operator holds no request
  logs. The privacy page points at GitHub's General Privacy Statement for them.
- Privacy and cookie pages live in `app/(legal)`. Update both pages and `updated.ts` when data handling changes.
- Footer policy links open in a new tab to preserve unsaved editor state.
