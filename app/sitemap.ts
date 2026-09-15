import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy", "/cookies"].map((path) => ({
    url: "https://linkedin.gayakaci.duckdns.org" + path,
  }));
}
