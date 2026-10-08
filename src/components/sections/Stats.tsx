import type { SiteConfig } from "@/lib/resume/schema";

export function Stats({ stats }: { stats: SiteConfig["stats"] }) {
  if (!stats.length) return null;
  return (
    <div className="mx-auto -mt-4 grid w-full max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card px-5 py-4">
          <div className="display text-fg-strong font-mono text-3xl">{s.value}</div>
          <div className="text-fg-muted mt-1 text-sm">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
