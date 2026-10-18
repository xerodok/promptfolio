import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { getAbout, getResume, getSite } from "@/lib/resume/load";

export const metadata: Metadata = { title: "About" };

/**
 * A longer-form page driven by content/about.json, kept apart from the
 * resume so the narrative can change without touching the main page.
 */
export default function AboutPage() {
  const resume = getResume();
  const site = getSite();
  const about = getAbout();
  return (
    <>
      <Nav name={resume.basics.name} image={resume.basics.image} nav={site.nav} />
      <main className="flex-1 pt-24 sm:pt-28">
        <article className="mx-auto w-full max-w-3xl px-4 pb-16">
          <header className="mb-10 text-center">
            <div className="text-accent mb-2 font-mono text-xs tracking-[0.2em] uppercase">
              {about.eyebrow}
            </div>
            <h1 className="display text-4xl sm:text-5xl">{about.title}</h1>
            {about.intro && (
              <p className="text-fg mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
                {about.intro}
              </p>
            )}
          </header>
          {about.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="display mb-3 text-2xl sm:text-3xl">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-fg mt-3 leading-relaxed">
                  {p}
                </p>
              ))}
              {s.bullets.length > 0 && (
                <ul className="text-fg mt-3 list-disc space-y-1.5 pl-5">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="border-border text-fg-muted mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-6 font-mono text-sm">
            <Link href="/" className="hover:text-fg-strong">
              <span aria-hidden="true" className="text-accent">
                &lt;
              </span>{" "}
              back to the resume
            </Link>
            {about.updated && <span>updated {about.updated}</span>}
          </div>
        </article>
      </main>
      <Footer resume={resume} />
    </>
  );
}
