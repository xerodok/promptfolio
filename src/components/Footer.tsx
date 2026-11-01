import type { Resume, SiteConfig } from "@/lib/resume/schema";
import { TEMPLATE } from "@/lib/template";

export function Footer({ resume, site }: { resume: Resume; site: SiteConfig }) {
  return (
    <footer className="no-print border-border border-t">
      <div className="text-fg-muted mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-sm">
        <span>
          {resume.basics.name}
          {resume.meta?.version ? ` · resume ${resume.meta.version}` : ""}
          {resume.meta?.lastModified ? ` · ${site.ui.updated} ${resume.meta.lastModified}` : ""}
        </span>
        <span className="font-mono">
          <a href="/api/resume" className="hover:text-fg-strong">
            /api/resume
          </a>{" "}
          ·{" "}
          <a href="/api/health" className="hover:text-fg-strong">
            /api/health
          </a>{" "}
          ·{" "}
          <a href="/print" className="hover:text-fg-strong">
            /print
          </a>
        </span>
        <span className="text-xs">
          {site.ui.builtWith}{" "}
          <a
            href={TEMPLATE.url}
            className="text-fg hover:text-fg-strong underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {TEMPLATE.name}
          </a>{" "}
          for {resume.basics.name}.
          {resume.basics.name !== TEMPLATE.author &&
            ` ${TEMPLATE.name} was created by ${TEMPLATE.author}.`}
        </span>
      </div>
    </footer>
  );
}
