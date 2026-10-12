import { Icon } from "@/components/Icon";
import type { Resume } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Projects({
  projects,
  heading,
}: {
  projects: Resume["projects"];
  heading: { eyebrow: string; title: string };
}) {
  return (
    <Section id="projects" eyebrow={heading.eyebrow} title={heading.title}>
      <div className="flex flex-wrap justify-center gap-4">
        {projects.map((p) => (
          <article
            key={p.name}
            className="card flex w-full flex-col items-center p-6 text-center sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
          >
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-fg-strong text-lg font-semibold">{p.name}</h3>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg-muted hover:text-fg-strong"
                  aria-label={`${p.name} link`}
                >
                  <Icon name="link" className="h-4 w-4" />
                </a>
              )}
            </div>
            {p.description && <p className="text-fg-muted mt-2 text-[0.95rem]">{p.description}</p>}
            {p.highlights.length > 0 && (
              <ul className="mt-3 inline-block list-disc space-y-1 pl-5 text-left text-sm">
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            {p.keywords.length > 0 && (
              <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-4">
                {p.keywords.map((k) => (
                  <span key={k} className="chip">
                    {k}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
