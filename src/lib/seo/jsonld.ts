import type { Resume } from "@/lib/resume/schema";

/**
 * Structured data for the home page: one schema.org `Person`, built from the
 * resume so a search for the name shows the title, employer and profiles.
 * Empty fields are left out rather than emitted as null.
 */
export type JsonLd = Record<string, unknown>;

/** `basics.image` is a path under public/ or a URL; a path needs `basics.url` to be absolute. */
function absoluteUrl(path: string, base: string | undefined): string | undefined {
  if (/^https?:\/\//.test(path)) return path;
  if (!base) return undefined;
  try {
    return new URL(path, base).toString();
  } catch {
    return undefined;
  }
}

export function personJsonLd(resume: Resume): JsonLd {
  const { basics } = resume;
  const person: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: basics.name,
  };
  if (basics.url) person.url = basics.url;
  const image = basics.image ? absoluteUrl(basics.image, basics.url) : undefined;
  if (image) person.image = image;
  if (basics.label) person.jobTitle = basics.label;
  if (basics.email) person.email = `mailto:${basics.email}`;

  const loc = basics.location;
  if (loc && (loc.city || loc.region || loc.countryCode)) {
    const address: JsonLd = { "@type": "PostalAddress" };
    if (loc.city) address.addressLocality = loc.city;
    if (loc.region) address.addressRegion = loc.region;
    if (loc.countryCode) address.addressCountry = loc.countryCode;
    person.address = address;
  }

  const sameAs = basics.profiles.map((p) => p.url).filter((u): u is string => Boolean(u));
  if (sameAs.length) person.sameAs = sameAs;

  const current = resume.work.find((w) => !w.endDate);
  if (current) {
    person.worksFor = {
      "@type": "Organization",
      name: current.name,
      ...(current.url ? { url: current.url } : {}),
    };
  }
  if (resume.education.length) {
    person.alumniOf = resume.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
      ...(e.url ? { url: e.url } : {}),
    }));
  }
  if (resume.skills.length) person.knowsAbout = resume.skills.map((s) => s.name);
  return person;
}

/**
 * JSON for a `<script type="application/ld+json">`. `<` is escaped so a value
 * containing `</script>` cannot close the element.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
