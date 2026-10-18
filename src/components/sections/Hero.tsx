import { Terminal } from "@/components/terminal/Terminal";
import { Icon, profileIcon } from "@/components/Icon";
import type { About, Resume, SiteConfig } from "@/lib/resume/schema";

export function Hero({ resume, site, about }: { resume: Resume; site: SiteConfig; about?: About }) {
  const { basics } = resume;
  // The line under the name: the site tagline when set, otherwise the resume headline.
  const subtitle = site.tagline || basics.label;
  const hasExperience = resume.work.length > 0;
  // With a photo the hero is a side-by-side row on wider screens (portrait
  // left, text left-aligned beside it); without one, or on phones, it stacks.
  const row = Boolean(basics.image);
  return (
    <section className="relative overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-12">
      <div className="hero-band" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div
          className={`mb-12 flex flex-col items-center gap-6 text-center ${
            row ? "md:flex-row md:items-center md:gap-10 md:text-left" : ""
          }`}
        >
          {basics.image && (
            // Plain <img>: the photo is a static asset or an external URL and needs no optimization pipeline.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={basics.image}
              alt={basics.name}
              width={192}
              height={192}
              className="h-32 w-32 shrink-0 rounded-full object-cover shadow-2xl ring-2 shadow-black/50 ring-white/25 sm:h-40 sm:w-40 md:h-48 md:w-48"
            />
          )}
          <div className="min-w-0">
            <h1 className="display text-6xl sm:text-7xl md:text-8xl">{basics.name}</h1>
            {subtitle && (
              <p className="text-fg-muted mt-3 text-2xl font-light sm:text-3xl">{subtitle}</p>
            )}
            {site.tagline && basics.label && (
              <p className={`text-fg mt-5 max-w-2xl text-base sm:text-lg ${row ? "" : "mx-auto"}`}>
                {basics.label}
              </p>
            )}
            <div
              className={`no-print mt-7 flex flex-wrap items-center justify-center gap-3 ${
                row ? "md:justify-start" : ""
              }`}
            >
              {hasExperience && (
                <a href="#experience" className="btn btn-primary">
                  Experience
                </a>
              )}
              <a href="#contact" className={hasExperience ? "btn btn-ghost" : "btn btn-primary"}>
                Contact
              </a>
              {basics.profiles.map((p) => (
                <a
                  key={p.network}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost !px-3"
                  aria-label={p.network}
                  title={p.network}
                >
                  <Icon name={profileIcon(p.network)} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-4xl">
          <Terminal resume={resume} site={site} about={about} />
        </div>
      </div>
    </section>
  );
}
