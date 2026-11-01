import type { MetadataRoute } from "next";
import { getResume } from "@/lib/resume/load";

/**
 * /sitemap.xml — the two indexable pages. Empty (but valid) until `basics.url`
 * is set, because sitemap entries must be absolute URLs. `meta.lastModified`
 * from the resume is the only date we know without reading the clock.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const resume = getResume();
  const base = resume.basics.url;
  if (!base) return [];
  const lastModified = resume.meta?.lastModified;
  return [
    { url: new URL("/", base).href, lastModified, priority: 1 },
    { url: new URL("/about", base).href, lastModified, priority: 0.6 },
  ];
}
