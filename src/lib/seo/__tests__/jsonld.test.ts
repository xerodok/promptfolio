import { describe, expect, it } from "vitest";
import { getResume } from "@/lib/resume/load";
import { resumeSchema } from "@/lib/resume/schema";
import { personJsonLd, serializeJsonLd } from "../jsonld";

describe("personJsonLd", () => {
  it("describes the sample persona", () => {
    const resume = getResume();
    const person = personJsonLd(resume);
    expect(person["@context"]).toBe("https://schema.org");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe(resume.basics.name);
    expect(person.url).toBe(resume.basics.url);
    expect(person.jobTitle).toBe(resume.basics.label);
    expect(person.email).toBe(`mailto:${resume.basics.email}`);
    expect(person.sameAs).toEqual(resume.basics.profiles.map((p) => p.url));
    const current = resume.work.find((w) => !w.endDate);
    expect(person.worksFor).toMatchObject({ "@type": "Organization", name: current?.name });
    expect(person.alumniOf).toHaveLength(resume.education.length);
    expect(person.knowsAbout).toEqual(resume.skills.map((s) => s.name));
    expect((person.address as Record<string, string>).addressLocality).toBe(
      resume.basics.location?.city,
    );
  });
  it("emits only the type and name for a minimal resume", () => {
    const person = personJsonLd(resumeSchema.parse({ basics: { name: "Sam" } }));
    expect(Object.keys(person).sort()).toEqual(["@context", "@type", "name"]);
  });
  it("leaves a relative image out when there is no site URL to resolve it against", () => {
    const person = personJsonLd(resumeSchema.parse({ basics: { name: "Sam", image: "/me.jpg" } }));
    expect(person.image).toBeUndefined();
    const withUrl = personJsonLd(
      resumeSchema.parse({ basics: { name: "Sam", image: "/me.jpg", url: "https://sam.example" } }),
    );
    expect(withUrl.image).toBe("https://sam.example/me.jpg");
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so content cannot close the script element", () => {
    const json = serializeJsonLd({ name: "</script><b>x</b>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: "</script><b>x</b>" });
  });
});
