import type { Resume } from "@/lib/resume/schema";

export function Footer({ resume }: { resume: Resume }) {
  return (
    <footer className="no-print border-border border-t">
      <div className="text-fg-muted mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm">
        <span>
          {resume.basics.name}
          {resume.meta?.version ? ` · resume ${resume.meta.version}` : ""}
          {resume.meta?.lastModified ? ` · updated ${resume.meta.lastModified}` : ""}
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
      </div>
    </footer>
  );
}
