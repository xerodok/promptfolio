import { describe, expect, it } from "vitest";
import { aboutSchema, siteSchema } from "../schema";

describe("siteSchema defaults", () => {
  it("fills every presentation field from an empty object", () => {
    const site = siteSchema.parse({});
    expect(site.background).toBe("ascii");
    expect(site.prompt).toBe("guest@resume");
    expect(site.sections.contact.blurb.length).toBeGreaterThan(0);
    expect(site.ui.pdf).toBe("PDF");
    expect(site.ui.print.education.length).toBeGreaterThan(0);
    expect(Array.isArray(site.nav)).toBe(true);
    expect(site.logos).toEqual({});
    expect(site.leadership).toBeUndefined();
  });
  it("lets a fork override a single ui string without repeating the rest", () => {
    const site = siteSchema.parse({ ui: { pdf: "Download" } });
    expect(site.ui.pdf).toBe("Download");
    expect(site.ui.json).toBe("JSON");
  });
  it("rejects an unknown background", () => {
    expect(siteSchema.safeParse({ background: "matrix" }).success).toBe(false);
  });
  it("defaults commands to none and requires shell-safe names", () => {
    expect(siteSchema.parse({}).commands).toEqual([]);
    const ok = { name: "stack-2", description: "d", output: ["x"] };
    expect(siteSchema.parse({ commands: [ok] }).commands).toEqual([ok]);
    expect(siteSchema.safeParse({ commands: [{ ...ok, name: "Stack!" }] }).success).toBe(false);
  });
});

describe("aboutSchema", () => {
  it("defaults everything from an empty object", () => {
    const about = aboutSchema.parse({});
    expect(typeof about.title).toBe("string");
    expect(about.sections).toEqual([]);
  });
});
