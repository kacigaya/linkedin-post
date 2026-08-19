FROM oven/bun:1.3.14 AS bun

FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS build
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN node node_modules/next/dist/bin/next build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# next.config.ts sets output: "standalone"; the runner needs the traced server
# plus the static assets it does not trace.
COPY --chown=node:node --from=build /app/.next/standalone ./
COPY --chown=node:node --from=build /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
