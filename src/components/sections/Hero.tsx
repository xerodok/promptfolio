import { Terminal } from "@/components/terminal/Terminal";
import { Icon, profileIcon } from "@/components/Icon";
import type { Resume, SiteConfig } from "@/lib/resume/schema";

export function Hero({ resume, site }: { resume: Resume; site: SiteConfig }) {
  const { basics } = resume;
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div className="hero-band" aria-hidden="true" />
      <div className="hero-fade" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="display text-6xl sm:text-7xl md:text-8xl">{basics.name}</h1>
          <p className="text-fg-muted mt-3 text-2xl font-light italic sm:text-3xl">
            {site.tagline}
          </p>
          {basics.label && (
            <p className="text-fg mx-auto mt-5 max-w-2xl text-base sm:text-lg">{basics.label}</p>
          )}
          <div className="no-print mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#experience" className="btn btn-primary">
              See experience
            </a>
            <a href="#contact" className="btn btn-ghost">
              Get in touch
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
        <div className="mx-auto max-w-4xl">
          <Terminal resume={resume} site={site} />
        </div>
      </div>
    </section>
  );
}
