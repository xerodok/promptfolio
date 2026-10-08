import { describe, expect, it } from "vitest";
import { getResume, getSite } from "../load";
import { resumeSchema } from "../schema";

describe("content/resume.json", () => {
  it("is a valid JSON Resume document", () => {
    const resume = getResume();
    expect(resume.basics.name.length).toBeGreaterThan(0);
    expect(resume.work.length).toBeGreaterThan(0);
  });
  it("lists work in reverse chronological order", () => {
    const starts = getResume().work.map((w) => w.startDate);
    const sorted = [...starts].sort().reverse();
    expect(starts).toEqual(sorted);
  });
  it("rejects a malformed document", () => {
    const result = resumeSchema.safeParse({ basics: { name: "" }, work: [{ name: "x" }] });
    expect(result.success).toBe(false);
  });
});

describe("content/site.json", () => {
  it("parses and only uses known highlight icons", () => {
    const site = getSite();
    expect(site.highlights.length).toBeGreaterThan(0);
    expect(site.nav.every((n) => n.href.startsWith("#") || n.href.startsWith("/"))).toBe(true);
  });
});
