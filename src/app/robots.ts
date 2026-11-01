import type { MetadataRoute } from "next";
import { getResume } from "@/lib/resume/load";

/**
 * /robots.txt — index the resume and the About page, keep crawlers out of the
 * print view and the JSON routes. The sitemap link needs `basics.url`.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getResume().basics.url;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/print", "/api/"] }],
    sitemap: base ? new URL("/sitemap.xml", base).href : undefined,
  };
}
