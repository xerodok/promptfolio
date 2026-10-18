import { formatRange } from "@/lib/resume/format";
import type { Resume, SiteConfig } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Experience({
  work,
  heading,
  logos,
}: {
  work: Resume["work"];
  heading: { eyebrow: string; title: string };
  /** Employer name -> logo image, from site.json; initials when absent. */
  logos: SiteConfig["logos"];
}) {
  return (
    <Section id="experience" eyebrow={heading.eyebrow} title={heading.title}>
      <ol className="border-border relative border-l pl-8">
        {work.map((job, i) => (
          <li key={`${job.name}-${job.startDate}`} className={i < work.length - 1 ? "pb-12" : ""}>
            <span
              className="border-bg bg-accent absolute -left-[7px] mt-2 h-3.5 w-3.5 rounded-full border-2"
              aria-hidden="true"
            />
            <div className="card p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <EmployerMark name={job.name} logo={logos[job.name]} />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 sm:justify-between">
                    <h3 className="text-fg-strong text-xl font-semibold">{job.position}</h3>
                    <span className="text-fg-muted font-mono text-sm">
                      {formatRange(job.startDate, job.endDate)}
                    </span>
                  </div>
                  <div className="text-fg mt-0.5">
                    {job.url ? (
                      <a
                        href={job.url}
                        className="hover:text-fg-strong"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {job.name}
                      </a>
                    ) : (
                      job.name
                    )}
                    {job.location && <span className="text-fg-muted"> · {job.location}</span>}
                  </div>
                </div>
              </div>
              {job.summary && <p className="text-fg-muted mt-3">{job.summary}</p>}
              {job.highlights.length > 0 && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem]">
                  {job.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {job.keywords.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.keywords.map((k) => (
                    <span key={k} className="chip">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/**
 * The employer's logo on a light tile (most logos are drawn for a light
 * background), or a monogram tile when no logo is configured.
 */
function EmployerMark({ name, logo }: { name: string; logo?: string }) {
  return logo ? (
    // One square tile for every employer; the logo fits inside, whatever its shape.
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white p-1.5 ring-1 ring-white/20">
      {/* Plain <img>: logos are small static assets and need no optimization pipeline. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" width={44} height={44} className="max-h-11 max-w-11 object-contain" />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="bg-surface-hover text-fg-strong grid h-14 w-14 shrink-0 place-items-center rounded-lg font-mono text-lg font-bold ring-1 ring-white/10"
    >
      {monogram(name)}
    </span>
  );
}

function monogram(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
