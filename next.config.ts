import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export served by GitHub Pages from https://kacigaya.github.io/linkedin-post/.
  // Pages sets no custom headers, so the CSP lives in a meta tag in app/layout.tsx.
  output: "export",
  basePath: "/linkedin-post",
  // Pages serves `privacy/index.html`, not `privacy.html`, so `/privacy/` must be the URL.
  trailingSlash: true,
};

export default nextConfig;
