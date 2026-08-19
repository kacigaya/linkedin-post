# linkedin-post

LinkedIn post mockup generator. Next.js App Router, React 19, Tailwind 4, Bun.
Entirely client-side: no API routes, no database, no environment variables.

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

## Constraints worth keeping

- `next.config.ts` sets `output: "standalone"`; the Dockerfile runner copies
  `.next/standalone` and `.next/static`. Removing it breaks the image.
- The post body is a `<textarea>` on purpose. Do not replace it with
  `contenteditable` — free editing is the feature.
- `PostCard` renders `mode="static"` during export because html-to-image clones
  textareas without their value.
- No web fonts: the card uses the system sans stack, which keeps the export
  deterministic and the Docker build offline-safe.
