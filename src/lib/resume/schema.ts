import { z } from "zod";

/**
 * A pragmatic Zod model of the JSON Resume schema (https://jsonresume.org/schema).
 * Only the fields this site renders are strictly typed; unknown keys are
 * preserved so the document stays a valid, portable JSON Resume.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "Expected YYYY, YYYY-MM or YYYY-MM-DD");

export const profileSchema = z.looseObject({
  network: z.string(),
  username: z.string().optional(),
  url: z.url().optional(),
});

export const locationSchema = z.looseObject({
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
});

export const basicsSchema = z.looseObject({
  name: z.string().min(1),
  label: z.string().optional(),
  image: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  url: z.url().optional(),
  summary: z.string().optional(),
  location: locationSchema.optional(),
  profiles: z.array(profileSchema).default([]),
});

export const workSchema = z.looseObject({
  name: z.string(),
  position: z.string(),
  url: z.url().optional(),
  location: z.string().optional(),
  startDate: isoDate,
  endDate: isoDate.optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export const educationSchema = z.looseObject({
  institution: z.string(),
  url: z.url().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).default([]),
});

export const certificateSchema = z.looseObject({
  name: z.string(),
  date: isoDate.optional(),
  issuer: z.string().optional(),
  url: z.url().optional(),
});

export const skillSchema = z.looseObject({
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

export const projectSchema = z.looseObject({
  name: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  url: z.url().optional(),
  roles: z.array(z.string()).default([]),
  entity: z.string().optional(),
  type: z.string().optional(),
});

export const languageSchema = z.looseObject({
  language: z.string(),
  fluency: z.string().optional(),
});

export const interestSchema = z.looseObject({
  name: z.string(),
  keywords: z.array(z.string()).default([]),
});

export const metaSchema = z.looseObject({
  canonical: z.url().optional(),
  version: z.string().optional(),
  lastModified: z.string().optional(),
});

export const resumeSchema = z.looseObject({
  basics: basicsSchema,
  work: z.array(workSchema).default([]),
  volunteer: z.array(z.looseObject({})).default([]),
  education: z.array(educationSchema).default([]),
  awards: z.array(z.looseObject({})).default([]),
  certificates: z.array(certificateSchema).default([]),
  publications: z.array(z.looseObject({})).default([]),
  skills: z.array(skillSchema).default([]),
  languages: z.array(languageSchema).default([]),
  interests: z.array(interestSchema).default([]),
  references: z.array(z.looseObject({})).default([]),
  projects: z.array(projectSchema).default([]),
  meta: metaSchema.optional(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type Work = z.infer<typeof workSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;

/** Presentation-only configuration that is not part of JSON Resume. */
export const highlightIcons = ["cluster", "git", "pulse", "shield", "code", "terminal"] as const;
export type HighlightIcon = (typeof highlightIcons)[number];

export const siteSchema = z.object({
  /** Italic line under the name. Leave empty to show `basics.label` there instead. */
  tagline: z.string().default(""),
  sections: z
    .object({
      highlights: z
        .object({ eyebrow: z.string(), title: z.string() })
        .default({ eyebrow: "Skill Portfolio", title: "Platform engineering, end to end" }),
    })
    .prefault({}),
  prompt: z.string().default("guest@resume"),
  stats: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .max(6)
    .default([]),
  highlights: z
    .array(
      z.object({
        icon: z.enum(highlightIcons),
        title: z.string(),
        body: z.string(),
      }),
    )
    .default([]),
  nav: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});

export type SiteConfig = z.infer<typeof siteSchema>;
