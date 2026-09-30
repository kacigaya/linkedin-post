import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/privacy/", "/cookies/", "/terms/", "/legal-notice/"].map((path) => ({
    url: SITE_URL + path,
  }));
}
