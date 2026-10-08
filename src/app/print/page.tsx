import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, formatRange } from "@/lib/resume/format";
import { getResume } from "@/lib/resume/load";

export const metadata: Metadata = { title: "Print", robots: { index: false } };

/**
 * A plain, single-column rendering of the same resume document, styled for
 * paper. Use the browser's "Save as PDF" to export it.
 */
export default function PrintPage() {
  const r = getResume();
  const b = r.basics;
  return (
    <main className="mx-auto w-full max-w-3xl bg-white px-8 py-10 text-[#111] print:px-0 print:py-0">
      <div className="no-print mb-6 flex items-center justify-between rounded-md border border-[#ddd] bg-[#f6f7f9] px-4 py-3 text-sm">
        <span>
          Press <kbd className="rounded border border-[#bbb] px-1">Ctrl/⌘ + P</kbd> and choose “Save
          as PDF”.
        </span>
        <Link href="/" className="underline">
          Back to site
        </Link>
      </div>

      <header className="border-b border-[#ddd] pb-4">
        <h1 className="text-3xl font-semibold text-black">{b.name}</h1>
        {b.label && <div className="text-[#444]">{b.label}</div>}
        <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-[#444]">
          {b.email && <span>{b.email}</span>}
          {b.url && <span>{b.url.replace(/^https?:\/\//, "")}</span>}
          {b.location?.city && (
            <span>{[b.location.city, b.location.region].filter(Boolean).join(", ")}</span>
          )}
          {b.profiles.map((p) => (
            <span key={p.network}>{(p.url ?? p.username ?? "").replace(/^https?:\/\//, "")}</span>
          ))}
        </div>
      </header>

      {b.summary && <p className="mt-4">{b.summary}</p>}

      <PrintSection title="Experience">
        {r.work.map((w) => (
          <div key={`${w.name}-${w.startDate}`} className="mb-4 break-inside-avoid">
            <div className="flex justify-between gap-4">
              <strong className="text-black">
                {w.position}, {w.name}
              </strong>
              <span className="text-sm whitespace-nowrap text-[#444]">
                {formatRange(w.startDate, w.endDate)}
              </span>
            </div>
            {w.summary && <div className="text-[#333]">{w.summary}</div>}
            <ul className="mt-1 list-disc pl-5">
              {w.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </PrintSection>

      <PrintSection title="Skills">
        {r.skills.map((s) => (
          <div key={s.name} className="flex gap-2">
            <span className="w-48 shrink-0 font-medium text-black">{s.name}</span>
            <span>{s.keywords.join(", ")}</span>
          </div>
        ))}
      </PrintSection>

      {r.projects.length > 0 && (
        <PrintSection title="Projects">
          {r.projects.map((p) => (
            <div key={p.name} className="mb-2 break-inside-avoid">
              <strong className="text-black">{p.name}</strong>
              {p.url && (
                <span className="text-sm text-[#444]"> — {p.url.replace(/^https?:\/\//, "")}</span>
              )}
              {p.description && <div>{p.description}</div>}
            </div>
          ))}
        </PrintSection>
      )}

      <PrintSection title="Education & Certifications">
        {r.education.map((e) => (
          <div key={e.institution} className="flex justify-between gap-4">
            <span>
              <strong className="text-black">
                {[e.studyType, e.area].filter(Boolean).join(" ")}
              </strong>
              , {e.institution}
            </span>
            {e.startDate && (
              <span className="text-sm text-[#444]">{formatRange(e.startDate, e.endDate)}</span>
            )}
          </div>
        ))}
        {r.certificates.map((c) => (
          <div key={c.name} className="flex justify-between gap-4">
            <span>
              {c.name}
              {c.issuer ? `, ${c.issuer}` : ""}
            </span>
            {c.date && <span className="text-sm text-[#444]">{formatDate(c.date)}</span>}
          </div>
        ))}
      </PrintSection>
    </main>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 border-b border-[#ddd] text-xs font-semibold tracking-[0.2em] text-[#555] uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
