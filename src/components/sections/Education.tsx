import { formatDate, formatRange } from "@/lib/resume/format";
import type { Resume } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Education({
  education,
  certificates,
  heading,
}: {
  education: Resume["education"];
  certificates: Resume["certificates"];
  heading: { eyebrow: string; title: string };
}) {
  return (
    <Section id="education" eyebrow={heading.eyebrow} title={heading.title}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          {education.map((e) => (
            <div key={e.institution} className="card p-6 text-center">
              <h3 className="text-fg-strong font-semibold">
                {[e.studyType, e.area].filter(Boolean).join(" ")}
              </h3>
              <div className="text-fg">{e.institution}</div>
              {e.startDate && (
                <div className="text-fg-muted mt-1 font-mono text-sm">
                  {formatRange(e.startDate, e.endDate)}
                </div>
              )}
            </div>
          ))}
        </div>
        <ul className="card divide-border divide-y p-2">
          {certificates.map((c) => (
            <li key={c.name} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-fg-strong font-medium">{c.name}</div>
                {c.issuer && <div className="text-fg-muted text-sm">{c.issuer}</div>}
              </div>
              {c.date && (
                <span className="text-fg-muted font-mono text-sm">{formatDate(c.date)}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
