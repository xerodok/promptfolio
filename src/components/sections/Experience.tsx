import { formatRange } from "@/lib/resume/format";
import type { Resume } from "@/lib/resume/schema";
import { Section } from "./Section";

export function Experience({
  work,
  heading,
}: {
  work: Resume["work"];
  heading: { eyebrow: string; title: string };
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
              <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 text-center sm:justify-between sm:text-left">
                <h3 className="text-fg-strong text-xl font-semibold">{job.position}</h3>
                <span className="text-fg-muted font-mono text-sm">
                  {formatRange(job.startDate, job.endDate)}
                </span>
              </div>
              <div className="text-fg mt-0.5 text-center sm:text-left">
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
