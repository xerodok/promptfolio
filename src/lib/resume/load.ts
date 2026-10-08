import resumeJson from "../../../content/resume.json";
import siteJson from "../../../content/site.json";
import { resumeSchema, siteSchema, type Resume, type SiteConfig } from "./schema";

/**
 * Content is bundled at build time, so validation runs once per process.
 * The same loader backs the pages, the JSON API and the readiness probe,
 * so a malformed document fails the build (and /api/ready) rather than a page.
 */
let cached: { resume: Resume; site: SiteConfig } | undefined;

export function loadContent(): { resume: Resume; site: SiteConfig } {
  if (!cached) {
    cached = {
      resume: resumeSchema.parse(resumeJson),
      site: siteSchema.parse(siteJson),
    };
  }
  return cached;
}

export function getResume(): Resume {
  return loadContent().resume;
}

export function getSite(): SiteConfig {
  return loadContent().site;
}
