import type { Metadata } from "next";
import { AsciiField } from "@/components/AsciiField";
import { getResume, getSite } from "@/lib/resume/load";
import "./globals.css";

const resume = getResume();
const site = getSite();

export const metadata: Metadata = {
  metadataBase: resume.basics.url ? new URL(resume.basics.url) : undefined,
  title: {
    default: `${resume.basics.name} — ${resume.basics.label ?? "Resume"}`,
    template: `%s · ${resume.basics.name}`,
  },
  description: resume.basics.summary,
  openGraph: {
    title: resume.basics.name,
    description: site.tagline,
    type: "profile",
    url: "./",
  },
  // "./" resolves to the current page against metadataBase, so each page gets
  // its own canonical URL. Both are omitted when `basics.url` is unset.
  alternates: { canonical: "./", types: { "application/json": "/api/resume" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {/* The background layer behind every page (site.json `background`); the
            terminal's Settings tab can hide it via html[data-aurora="off"]. */}
        {site.background === "aurora" && (
          <div className="aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        {site.background === "ascii" && (
          <div className="aurora" aria-hidden="true">
            <AsciiField />
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
